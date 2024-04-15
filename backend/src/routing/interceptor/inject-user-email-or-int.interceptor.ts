import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { UserService } from '../../user/user.service';
import { subscriptionExpiredMessage } from '../../../../shared/messages/error.message';
import { SubscriptionService } from '../../user/subscription.service';
import { IntegrationUserService } from '../../user/integration-user.service';
import { UserDocument } from '../../user/schema/user.schema';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { FetchSnapshotService } from '../../location/fetch-snapshot.service';

@Injectable()
export class InjectUserEmailOrIntInterceptor implements NestInterceptor {
  constructor(
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
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
      const snapshotDoc =
        await this.fetchSnapshotService.fetchSnapshotDocByToken(
          req.body.snapshotToken,
          { projectQuery: { userId: 1 } },
        );

      if (!snapshotDoc) {
        throw new HttpException('Unknown token', 400);
      }

      // to keep in consistency with 'isIntegrationUser' property
      const isIntegrationSnapshot = !snapshotDoc.userId;

      if (!isIntegrationSnapshot) {
        this.fetchSnapshotService.checkLocationExpiration(snapshotDoc);
      }

      user = await this.userService.findById({ userId: snapshotDoc.userId });
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
