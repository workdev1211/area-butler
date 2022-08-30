import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

import { UserDocument } from '../user/schema/user.schema';
import { SubscriptionService } from '../user/subscription.service';

@Injectable()
export class UserSubscriptionPipe implements PipeTransform {
  constructor(private subscriptionService: SubscriptionService) {}

  async transform(user: UserDocument): Promise<UserDocument> {
    if (!user) {
      throw new HttpException('Unknown User', 400);
    }

    const userSubscription = await this.subscriptionService.findActiveByUserId(
      user.parentId || user.id,
    );

    if (!userSubscription) {
      throw new HttpException('User has no active subscription', 400);
    }

    user.subscription = userSubscription;

    return user;
  }
}
