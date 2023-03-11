import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, scheduled, asyncScheduler } from 'rxjs';

import { OnOfficeService } from '../on-office.service';

@Injectable()
export class CheckActivationIframeSignatureInterceptor
  implements NestInterceptor
{
  constructor(private readonly onOfficeService: OnOfficeService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const queryParams = { ...req.query };
    queryParams.url = `https://${req.get('host')}${req.route.path}`;

    try {
      this.onOfficeService.verifySignature(queryParams);
    } catch {
      return scheduled(
        [res.render('on-office/activation-iframe-wrong-signature')],
        asyncScheduler,
      );
    }

    return next.handle();
  }
}
