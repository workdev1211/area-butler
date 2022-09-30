import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { UserService } from './user.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const email = request.user?.email;

    if (email) {
      const user = await this.userService.upsertUser(email, email);

      if (user) {
        request.principal = user;
      }
    }

    return true;
  }
}
