import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { IntegrationUserService } from '../../user/integration-user.service';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';

@Injectable()
export class InjectIntegrationUserInterceptor implements NestInterceptor {
  constructor(
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const { extendedClaim, integrationType } = req.body;
    let integrationUser: TIntegrationUserDocument;

    if (extendedClaim) {
      integrationUser =
        await this.integrationUserService.findOneOrFailByExtendedClaim(
          extendedClaim,
          integrationType,
        );
    }

    if (!integrationUser) {
      throw new HttpException('Unknown user!', 400);
    }

    req.principal = integrationUser;

    return next.handle();
  }
}
