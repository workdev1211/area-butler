import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { IUserRequest } from '../../user/type/user';
import { CompanyUserService } from '../company-user.service';

const CONSENT_ROUTE_PATH = '/api/company-user/consent';
const LOGIN_ROUTE_PATH = '/api/company-user/login';

@Injectable()
export class UpsertUserInterceptor implements NestInterceptor {
  constructor(private readonly companyUserService: CompanyUserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req: IUserRequest = context.switchToHttp().getRequest();
    const email = req.user?.email;

    if (
      !email ||
      ![CONSENT_ROUTE_PATH, LOGIN_ROUTE_PATH].includes(req.route.path)
    ) {
      throw new UnauthorizedException();
    }

    req.principal = await this.companyUserService.upsertUser(email, email);

    return next.handle();
  }
}
