import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RealEstateListingIntService } from '../real-estate-listing-int.service';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { IntegrationActionTypeEnum } from '@area-butler-types/integration';

@Injectable()
export class ProcessOpenAiIntUsageInterceptor implements NestInterceptor {
  constructor(
    private readonly realEstateListingIntService: RealEstateListingIntService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const { integrationId } = req.body;
    const integrationUser: TIntegrationUserDocument = req.principal;

    const realEstate =
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationType: integrationUser.integrationType,
        integrationUserId: integrationUser.integrationUserId,
      });

    const { openAiRequestQuantity } = realEstate.integrationParams;

    if (!integrationUser.isSubscriptionActive && !openAiRequestQuantity) {
      await this.realEstateListingIntService.handleProductUnlock(
        integrationUser,
        { integrationId, actionType: IntegrationActionTypeEnum.UNLOCK_OPEN_AI },
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
        if (integrationUser.isSubscriptionActive) {
          return;
        }

        if (updatedRealEstate.integrationParams.openAiRequestQuantity) {
          updatedRealEstate.integrationParams.openAiRequestQuantity -= 1;
          await updatedRealEstate.save();
        }
      }),
    );
  }
}
