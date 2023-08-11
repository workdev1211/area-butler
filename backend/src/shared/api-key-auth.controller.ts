import { UseGuards } from '@nestjs/common';

import { ApiKeyGuard } from '../auth/api-key.guard';

@UseGuards(ApiKeyGuard)
export class ApiKeyAuthController {}
