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
    const onOfficeQueryParams = { ...req.body.onOfficeQueryParams };

    try {
      this.onOfficeService.verifySignature(onOfficeQueryParams, req.body.url);
    } catch (e) {
      this.logger.debug(onOfficeQueryParams, req.body);
      throw e;
    }

    return next.handle();
  }
}
