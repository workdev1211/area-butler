import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { OnOfficeService } from '../on-office.service';

@Injectable()
export class VerifySignatureInterceptor implements NestInterceptor {
  constructor(private readonly onOfficeService: OnOfficeService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const requestParams = { ...req.body };
    this.onOfficeService.verifySignature(requestParams);

    return next.handle();
  }
}
