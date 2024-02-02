import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { propstackLoginRoutePath } from '../../../../shared/constants/propstack';
import { IntegrationUserService } from '../../user/integration-user.service';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import { PropstackService } from '../propstack.service';

@Injectable()
export class InjectPropstackLoginUserInterceptor implements NestInterceptor {
  private readonly logger = new Logger(
    InjectPropstackLoginUserInterceptor.name,
  );

  constructor(
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const routePath = req.route.path;
    const { authorization } = req.headers;
    const accessToken = authorization?.match(/^AccessToken (.*)$/)?.pop();
    let integrationUser;

    if (accessToken && routePath === propstackLoginRoutePath) {
      integrationUser = await this.integrationUserService.findOne(
        IntegrationTypesEnum.PROPSTACK,
        {
          integrationUserId: { $regex: /^\d*?$/ },
          'parameters.apiKey': PropstackService.decryptAccessToken(accessToken),
          // left just in case for future changes, etc.
          // isParent: true
        },
      );
    }

    if (!integrationUser) {
      this.logger.debug(
        `\nPath: ${routePath}` +
          `\nAccess token: ${accessToken}` +
          `\nAPI key: ${PropstackService.decryptAccessToken(accessToken)}` +
          `\nAuth header: ${authorization}`,
      );
      throw new HttpException('Unknown user!', 400);
    }

    req.principal = integrationUser;

    return next.handle();
  }
}
