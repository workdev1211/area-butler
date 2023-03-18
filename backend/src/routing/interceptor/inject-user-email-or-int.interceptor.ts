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

@Injectable()
export class InjectUserEmailOrIntInterceptor implements NestInterceptor {
  constructor(
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Request>> {
    const req = context.switchToHttp().getRequest();
    let user;

    if (req.body.userEmail) {
      user = await this.userService.findByEmail(req.body.userEmail);
    }

    if (!req.body.userEmail && req.body.snapshotToken) {
      const { userId } = await this.locationService.fetchSnapshotByToken(
        req.body.snapshotToken,
      );

      user = await this.userService.findById(userId);
    }

    if (!user) {
      throw new HttpException('Unknown User', 400);
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
