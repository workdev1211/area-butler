import { ApiUser } from '@area-butler-types/types';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { mapUserToApiUser } from './mapper/user.mapper';
import { UserService } from './user.service';

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  public async me(@Req() request): Promise<ApiUser> {
    const user = request?.user;
    return mapUserToApiUser(
      await this.userService.upsertUser(user.email, user.email),
    );
  }
}
