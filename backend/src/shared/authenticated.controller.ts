import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserGuard } from 'src/user/user.guard';

@UseGuards(AuthGuard('jwt'), UserGuard)
export class AuthenticatedController {}
