import { ApiUpsertUser, ApiUser } from '@area-butler-types/types';
import { Body, Controller, Get, HttpException, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { mapUserToApiUser } from './mapper/user.mapper';
import { UserDocument } from './schema/user.schema';
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

  @Post('me')
  public async patch(@Req() request, @Body() upsertUser: ApiUpsertUser): Promise<ApiUser> {
    const user = request?.user;
    return mapUserToApiUser(
      await this.userService.patchUser(user.email, upsertUser)
    );
  }

  @Post('me/consent')
  public async giveConsent(@Req() request): Promise<ApiUser> {
    const user = request?.user;
    return mapUserToApiUser(
      await this.userService.giveConsent(user.email)
    );
  }

  @Post('me/increase-limit')
  public async increaseLimit(@Req() request, @Body() {amount}: {amount: number}): Promise<ApiUser> {
    const user = request?.user;
    let existingUser: UserDocument = await this.userService.findByEmail(user.email);

    if(!existingUser) {
      throw new HttpException('Unknown User', 400);
    }

    existingUser = await this.userService.addRequestContingentIncrease(existingUser, amount);
    return mapUserToApiUser(existingUser);
  }

}
