import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from './service/user.service';
import { IUserRequest } from './type/user';

@Injectable()
export class UserGuard implements CanActivate {
  private readonly logger = new Logger(UserGuard.name);

  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: IUserRequest = context.switchToHttp().getRequest();
    const email = req.user?.email;

    if (!email) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.debug(`\nRoute path: ${req.route.path}\nEmail: ${email}`);
      throw new NotFoundException('Unknown user!');
    }

    req.principal = user;

    return true;
  }
}
