import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { tap, Observable } from 'rxjs';

import { RealEstateListingService } from '../real-estate-listing.service';
import { IntegrationUserService } from '../../user/integration-user.service';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { initOpenAiReqQuantity } from '../../../../shared/constants/on-office/products';

@Injectable()
export class ProcessOpenAiIntUsageInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ProcessOpenAiIntUsageInterceptor.name);

  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const path = req.route.path;
    const { realEstateListingId, isFormalToInformal } = req.body;
    const integrationUser = req.principal;
    let actionType;

    switch (path) {
      case '/api/location-integration/open-ai-loc-desc': {
        actionType = OpenAiQueryTypeEnum.LOCATION_DESCRIPTION;
        break;
      }

      case '/api/real-estate-listing-int/open-ai-real-estate-desc': {
        actionType = OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION;
        break;
      }

      case '/api/location-integration/open-ai-loc-real-est-desc': {
        actionType = OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION;
        break;
      }

      case '/api/open-ai-integration/query': {
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
      this.integrationUserService.checkProdContAvailability(
        integrationUser,
        actionType,
      );

      // in case of the errors on the following steps
      realEstateListing.integrationParams.openAiRequestQuantity =
        initOpenAiReqQuantity;

      await realEstateListing.save();

      await this.integrationUserService.incrementProductUsage(
        integrationUser,
        actionType,
      );
    }

    req.realEstateListing = realEstateListing;

    return next.handle().pipe(
      tap(async () => {
        realEstateListing.integrationParams.openAiRequestQuantity -= 1;
        await realEstateListing.save();
      }),
    );
  }
}
