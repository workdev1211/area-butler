import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, scheduled, asyncScheduler } from 'rxjs';

import { OnOfficeService } from '../on-office.service';

@Injectable()
export class VerifyOnOfficeActSignInterceptor implements NestInterceptor {
  private readonly logger = new Logger(VerifyOnOfficeActSignInterceptor.name);

  constructor(private readonly onOfficeService: OnOfficeService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const queryParams = { ...req.query };

    try {
      this.onOfficeService.verifySignature(
        queryParams,
        `https://${req.get('host')}${req.route.path}`,
      );
    } catch {
      this.logger.debug(queryParams, req.query);

      return scheduled(
        [res.render('on-office/activation-iframe-wrong-signature')],
        asyncScheduler,
      );
    }

    return next.handle();
  }
}
