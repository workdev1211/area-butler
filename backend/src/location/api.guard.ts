import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { clientIdToUserId } from '../shared/api.constants';
import { configService } from '../config/config.service';

@Injectable()
export class ApiGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clientId = request.user?.azp;

    if (!clientId) {
      return false;
    }

    let user;

    try {
      user = await this.userService.findById(
        clientIdToUserId[clientId][configService.getStripeEnv()],
      );
    } catch (e) {}

    if (!user) {
      return false;
    }

    request.principal = user;

    return true;
  }
}
