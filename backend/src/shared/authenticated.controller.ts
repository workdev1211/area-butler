import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

import { UserGuard } from '../user/user.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard('auth0-spa'), UserGuard)
export class AuthenticatedController {}
