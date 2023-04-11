import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const InjectRealEstateListing = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.realEstateListing;
  },
);
