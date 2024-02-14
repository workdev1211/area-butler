import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { IntegrationUserService } from '../integration-user.service';
import { checkIsParent } from '../../../../shared/functions/integration.functions';

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
    const accessToken = authorization?.match(/^AccessToken (.*)$/)?.pop();
    let integrationUser;

    if (accessToken) {
      integrationUser = await this.integrationUserService
        .findByTokenOrFail(accessToken)
        .catch(() => undefined);

      const parentUser = integrationUser?.parentId
        ? await this.integrationUserService.findByDbId(integrationUser.parentId)
        : undefined;

      if (parentUser && checkIsParent(integrationUser, parentUser)) {
        integrationUser.parentUser = parentUser;
      }
    }

    if (!integrationUser) {
      this.logger.debug(
        `\nRoute path: ${req.route.path}\nAuth header: ${authorization}`,
      );

      throw new UnauthorizedException();
    }

    req.principal = integrationUser;

    return next.handle();
  }
}
