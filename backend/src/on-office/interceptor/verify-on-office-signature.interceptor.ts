import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { OnOfficeService } from '../on-office.service';

@Injectable()
export class VerifyOnOfficeSignatureInterceptor implements NestInterceptor {
  private readonly logger = new Logger(VerifyOnOfficeSignatureInterceptor.name);

  constructor(private readonly onOfficeService: OnOfficeService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const requestParams = { ...req.body };
    delete requestParams.extendedClaim;

    try {
      this.onOfficeService.verifySignature(requestParams);
    } catch (e) {
      this.logger.debug(requestParams, req.body);
      throw e;
    }

    return next.handle();
  }
}
