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
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { propstackLoginRoutePath } from '../../../../shared/constants/propstack';
import { PropstackService } from '../propstack.service';
import ApiPropstackLoginReqDto from '../dto/api-propstack-login-req.dto';

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

    let isWrongReqData =
      !apiKey || !reqBody || routePath !== propstackLoginRoutePath;

    if (!isWrongReqData) {
      isWrongReqData =
        (await validate(plainToInstance(ApiPropstackLoginReqDto, reqBody)))
          .length > 0;
    }

    if (isWrongReqData) {
      this.logger.debug(
        `\nRoute path: ${routePath}` +
          `\nAuth header: ${authorization}` +
          '\nReq body:',
        reqBody,
      );

      throw new UnprocessableEntityException();
    }

    // with parent user
    const integrationUser = await this.propstackService.getIntegrationUser({
      apiKey,
      shopId: reqBody.shopId as string,
      brokerId: reqBody.brokerId as string,
      teamId: reqBody.teamId as string,
    });

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
