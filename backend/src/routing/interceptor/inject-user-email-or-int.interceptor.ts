import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { LocationService } from '../../location/location.service';
import { UserService } from '../../user/user.service';
import { subscriptionExpiredMessage } from '../../../../shared/messages/error.message';
import { SubscriptionService } from '../../user/subscription.service';
import { IntegrationUserService } from '../../user/integration-user.service';
import { UserDocument } from '../../user/schema/user.schema';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';

@Injectable()
export class InjectUserEmailOrIntInterceptor implements NestInterceptor {
  constructor(
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Request>> {
    const req = context.switchToHttp().getRequest();
    const { authorization } = req.headers;
    const accessToken = authorization?.match(/^AccessToken (.*)$/);
    let user: UserDocument | TIntegrationUserDocument;

    if (req.body.userEmail) {
      user = await this.userService.findByEmail(req.body.userEmail);
    }

    if (!req.body.userEmail && req.body.snapshotToken) {
      const { userId } = await this.locationService.fetchSnapshotByToken(
        req.body.snapshotToken,
      );

      user = await this.userService.findById({ userId });
    }

    if (accessToken?.length === 2) {
      user = await this.integrationUserService.findByTokenOrFail(
        accessToken[1],
      );
    }

    if (!user) {
      throw new HttpException('Unknown user', 400);
    }

    if ('integrationUserId' in user) {
      req.user = {
        integrationUserDbId: user.id,
        integrationType: user.integrationType,
      };

      return next.handle();
    }

    const userSubscription = await this.subscriptionService.findActiveByUserId(
      user.parentId || user.id,
    );

    if (!userSubscription) {
      throw new HttpException(subscriptionExpiredMessage, 402);
    }

    req.user = { email: user.email };

    return next.handle();
  }
}
