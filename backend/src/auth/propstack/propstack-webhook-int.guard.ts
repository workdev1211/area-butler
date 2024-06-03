import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PropstackWebhookIntGuard extends AuthGuard(
  'propstack-webhook-int',
) {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const queryApiKey = request.query.apiKey;

    if (queryApiKey && !request.header('x-api-key')) {
      request.headers['x-api-key'] = queryApiKey;
    }

    return super.canActivate(context);
  }
}
