import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { OnOfficeService } from '../on-office.service';

@Injectable()
export class InjectOnOfficeIntUserInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InjectOnOfficeIntUserInterceptor.name);

  constructor(private readonly onOfficeService: OnOfficeService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const { extendedClaim, apiClaim } = req.body;
    const resultingClaim = extendedClaim || apiClaim;
    let integrationUser;

    if (resultingClaim) {
      integrationUser = await this.onOfficeService.findIntUserByExtendedClaim(
        resultingClaim,
      );
    }

    if (!integrationUser) {
      this.logger.debug(resultingClaim, req.body);
      throw new HttpException('Unknown user!', 400);
    }

    req.principal = integrationUser;

    return next.handle();
  }
}
