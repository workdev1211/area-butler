import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const InjectSnapshotId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest();
    return req.user?.snapshot_id;
  },
);
