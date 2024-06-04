import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import MyVivendaAuth0UserDto from '../dto/my-vivenda-auth0-user.dto';
import { clientIdToUserId } from '../../shared/constants/api';
import { UserService } from '../../user/user.service';
import { IAuth0User } from '../../auth/auth0/auth0-api.strategy';
import { configService } from '../../config/config.service';

export interface IMyVivendaAuth0User extends IAuth0User {
  snapshot_id: string;
  user_id?: string; // FOR DEV ENV ONLY
}

@Injectable()
export class MyVivendaHandleLoginInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MyVivendaHandleLoginInterceptor.name);
  private readonly appEnv = configService.getSystemEnv();

  constructor(private readonly userService: UserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();

    const auth0User: IMyVivendaAuth0User = plainToInstance(
      MyVivendaAuth0UserDto,
      req.user,
    );

    const isWrongUserData = auth0User
      ? (await validate(auth0User)).length > 0
      : true;

    if (!auth0User || isWrongUserData) {
      this.logger.error('Auth0 user:', req.user);
      throw new UnauthorizedException();
    }

    const clientId = auth0User.azp;
    let user;

    try {
      const userId =
        this.appEnv === 'prod' ? clientIdToUserId[clientId] : auth0User.user_id;

      user = await this.userService.findById({
        userId,
        withSubscription: true,
      });
    } catch (e) {}

    if (!user?.subscription) {
      this.logger.error('Auth0 user:', req.user);
      throw new UnauthorizedException();
    }

    req.principal = user;

    return next.handle();
  }
}
