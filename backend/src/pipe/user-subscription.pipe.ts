import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

import { UserDocument } from '../user/schema/user.schema';
import { SubscriptionService } from '../user/subscription.service';

// TODO think about moving the functionality to the 'InjectUser' decorator
@Injectable()
export class UserSubscriptionPipe implements PipeTransform {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async transform(user: UserDocument): Promise<UserDocument> {
    if (!user) {
      throw new HttpException('Unknown User', 400);
    }

    if (user.subscription) {
      return user;
    }

    const userSubscription = await this.subscriptionService.findActiveByUserId(
      user.parentId || user.id,
    );

    if (!userSubscription) {
      throw new HttpException('User has no active subscription.', 400);
    }

    user.subscription = userSubscription;

    return user;
  }
}
