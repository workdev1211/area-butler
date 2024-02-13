import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { propstackLoginRoutePath } from '../../../../shared/constants/propstack';
import { PropstackService } from '../propstack.service';

@Injectable()
export class InjectPropstackLoginUserInterceptor implements NestInterceptor {
  private readonly logger = new Logger(
    InjectPropstackLoginUserInterceptor.name,
  );

  constructor(private readonly propstackService: PropstackService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();

    const {
      body: reqBody,
      headers: { authorization },
      route: { path: routePath },
    } = req;

    const accessToken = authorization?.match(/^AccessToken (.*)$/)?.pop();
    let apiKey: string;

    try {
      apiKey = accessToken
        ? PropstackService.decryptAccessToken(accessToken)
        : undefined;
    } catch (e) {
      this.logger.error('Api key decryption failed.');
      this.logger.debug(e);
    }

    const isWrongReqData =
      !apiKey ||
      !reqBody ||
      !reqBody.shopId ||
      routePath !== propstackLoginRoutePath;

    if (isWrongReqData) {
      this.logger.debug(
        `\nRoute path: ${routePath}` +
          `\nAuth header: ${authorization}` +
          '\nReq body:',
        reqBody,
      );

      throw new UnprocessableEntityException();
    }

    const integrationUser = await this.propstackService.getIntegrationUser(
      apiKey,
      reqBody.shopId,
      reqBody.teamId,
    );

    if (!integrationUser) {
      this.logger.debug(
        `\nRoute path: ${routePath}` +
          `\nAuth header: ${authorization}` +
          `\nAPI key: ${apiKey}` +
          '\nReq body:',
        reqBody,
      );

      throw new UnauthorizedException();
    }

    req.principal = integrationUser;
    // There is no email for the moment
    // req.user = { email: (integrationUser.parameters as IApiIntUserPropstackParams).email };

    return next.handle();
  }
}
