import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { RealEstateListingService } from '../real-estate-listing.service';
import { IntegrationUserService } from '../../user/integration-user.service';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { RealEstateListingIntService } from '../real-estate-listing-int.service';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { IntegrationTypesEnum } from '@area-butler-types/integration';

@Injectable()
export class ProcessOpenAiIntUsageInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ProcessOpenAiIntUsageInterceptor.name);

  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const path = req.route.path;
    const { realEstateListingId, isFormalToInformal } = req.body;
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

    const realEstateListing =
      await this.realEstateListingService.fetchRealEstateListingById(
        integrationUser,
        realEstateListingId,
      );

    const { openAiRequestQuantity } = realEstateListing.integrationParams;

    if (!openAiRequestQuantity) {
      const availProdContType =
        await this.integrationUserService.getAvailProdContTypeOrFail(
          integrationUser,
          actionType,
        );

      await this.realEstateListingIntService.unlockProduct(
        integrationUser,
        availProdContType,
        realEstateListingId,
      );

      await this.integrationUserService.incrementProductUsage(
        integrationUser,
        availProdContType,
      );
    }

    const updatedRealEstateListing =
      await this.realEstateListingService.fetchRealEstateListingById(
        integrationUser,
        realEstateListingId,
      );

    req.realEstateListing = updatedRealEstateListing;

    return next.handle().pipe(
      tap(async () => {
        updatedRealEstateListing.integrationParams.openAiRequestQuantity -= 1;
        await updatedRealEstateListing.save();
      }),
    );
  }
}
