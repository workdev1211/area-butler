import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { RealEstateListingIntService } from '../real-estate-listing-int.service';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import { ContingentIntService } from '../../user/contingent-int.service';

@Injectable()
export class ProcessOpenAiIntUsageInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ProcessOpenAiIntUsageInterceptor.name);

  constructor(
    private readonly contingentIntService: ContingentIntService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const path = req.route.path;
    const { integrationId, isFormalToInformal } = req.body;
    const integrationUser: TIntegrationUserDocument = req.principal;
    let actionType;

    // TODO PROPSTACK CONTINGENT
    if (integrationUser.integrationType === IntegrationTypesEnum.PROPSTACK) {
      return next.handle();
    }

    switch (path) {
      case '/api/location-int/open-ai-loc-desc': {
        actionType = OpenAiQueryTypeEnum.LOCATION_DESCRIPTION;
        break;
      }

      case '/api/real-estate-listing-int/open-ai-real-estate-desc': {
        actionType = OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION;
        break;
      }

      case '/api/location-int/open-ai-loc-real-est-desc': {
        actionType = OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION;
        break;
      }

      case '/api/open-ai-int/query': {
        actionType = isFormalToInformal
          ? OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL
          : OpenAiQueryTypeEnum.GENERAL_QUESTION;

        break;
      }

      default: {
        this.logger.error(path);
        throw new HttpException('Unknown path!', 400);
      }
    }

    const realEstate =
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationType: integrationUser.integrationType,
        integrationUserId: integrationUser.integrationUserId,
      });

    const { openAiRequestQuantity } = realEstate.integrationParams;

    if (!openAiRequestQuantity) {
      const availProdContType =
        await this.contingentIntService.getAvailProdContTypeOrFail(
          integrationUser,
          actionType,
        );

      await this.realEstateListingIntService.unlockProduct(
        integrationUser,
        availProdContType,
        integrationId,
      );

      await this.contingentIntService.incrementProductUsage(
        integrationUser,
        availProdContType,
      );
    }

    const updatedRealEstate =
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationType: integrationUser.integrationType,
        integrationUserId: integrationUser.integrationUserId,
      });

    req.realEstate = updatedRealEstate;

    return next.handle().pipe(
      tap(async (): Promise<void> => {
        updatedRealEstate.integrationParams.openAiRequestQuantity -= 1;
        await updatedRealEstate.save();
      }),
    );
  }
}
