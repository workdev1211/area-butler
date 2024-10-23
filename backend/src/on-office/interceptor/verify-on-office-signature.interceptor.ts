import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import structuredClone from '@ungap/structured-clone';

import { OnOfficeService } from '../service/on-office.service';
import { TOnOfficeLoginQueryParams } from '@area-butler-types/on-office';

@Injectable()
export class VerifyOnOfficeSignatureInterceptor implements NestInterceptor {
  private readonly logger = new Logger(VerifyOnOfficeSignatureInterceptor.name);

  constructor(private readonly onOfficeService: OnOfficeService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    let onOfficeQueryParams: TOnOfficeLoginQueryParams;
    let url: string;

    try {
      onOfficeQueryParams = structuredClone(
        req.body.onOfficeQueryParams ? req.body.onOfficeQueryParams : req.query,
      );

      url =
        req.body.url ||
        `https://${req.hostname}${req.url}`.replace(/(.*)\?.*/, '$1');

      this.logger.verbose(url, onOfficeQueryParams);
      this.onOfficeService.verifySignature(onOfficeQueryParams, url);
    } catch (e) {
      this.logger.error(url, JSON.stringify(onOfficeQueryParams));
      this.logger.error(req.body, req.query);
      throw e;
    }

    return next.handle();
  }
}
