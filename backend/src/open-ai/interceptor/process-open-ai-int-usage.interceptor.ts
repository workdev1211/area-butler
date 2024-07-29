import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { RealEstateListingIntService } from '../../real-estate-listing/real-estate-listing-int.service';
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

    let realEstate =
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationType: integrationUser.integrationType,
        integrationUserId: integrationUser.integrationUserId,
      });

    if (
      !integrationUser.isSubscriptionActive &&
      !realEstate.integrationParams.openAiRequestQuantity
    ) {
      await this.realEstateListingIntService.handleProductUnlock(
        integrationUser,
        { integrationId, actionType: IntegrationActionTypeEnum.UNLOCK_OPEN_AI },
      );

      realEstate =
        await this.realEstateListingIntService.findOneOrFailByIntParams({
          integrationId,
          integrationType: integrationUser.integrationType,
          integrationUserId: integrationUser.integrationUserId,
        });
    }

    return next.handle().pipe(
      tap(async (): Promise<void> => {
        if (integrationUser.isSubscriptionActive) {
          return;
        }

        if (realEstate.integrationParams.openAiRequestQuantity) {
          realEstate.integrationParams.openAiRequestQuantity -= 1;
          await realEstate.save();
          return;
        }

        throw new UnprocessableEntityException(
          'Real estate entity is corrupted!',
        );
      }),
    );
  }
}
