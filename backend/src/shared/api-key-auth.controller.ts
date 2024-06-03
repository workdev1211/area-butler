import { UseGuards } from '@nestjs/common';

import { ApiKeyGuard } from '../auth/api-key/api-key.guard';

@UseGuards(ApiKeyGuard)
export class ApiKeyAuthController {}
