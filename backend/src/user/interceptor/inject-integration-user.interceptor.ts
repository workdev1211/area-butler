import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { IntegrationUserService } from '../integration-user.service';

@Injectable()
export class InjectIntegrationUserInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InjectIntegrationUserInterceptor.name);

  constructor(
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const { authorization } = req.headers;
    const accessToken = authorization?.replace(/^AccessToken (.*)$/, '$1');
    let integrationUser;

    if (accessToken) {
      integrationUser =
        await this.integrationUserService.findOneByAccessTokenOrFail(
          accessToken,
        );
    }

    if (!integrationUser) {
      this.logger.debug(accessToken, authorization);
      throw new HttpException('Unknown user!', 400);
    }

    req.principal = integrationUser;

    return next.handle();
  }
}
