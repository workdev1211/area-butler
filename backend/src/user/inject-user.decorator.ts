import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const InjectUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.principal;
  },
);
