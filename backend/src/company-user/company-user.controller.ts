import {
  Body,
  Controller,
  Get,
  Put,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CompanyUserService } from './company-user.service';
import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import UpdateApiCompanyConfigDto from '../company/dto/update-api-company-config.dto';
import ApiCompanyPresetDto from '../company/dto/api-company-preset.dto';
import { ApiUser } from '@area-butler-types/types';
import { UserService } from '../user/service/user.service';
import { UpsertUserInterceptor } from './interceptor/upsert-user.interceptor';
import { UserGuard } from '../user/user.guard';

@ApiTags('company', 'user')
@ApiBearerAuth()
@UseGuards(AuthGuard('auth0-spa'))
@Controller('api/company-user')
export class CompanyUserController {
  constructor(
    private readonly companyUserService: CompanyUserService,
    private readonly userService: UserService,
  ) {}

  @ApiProperty({ description: 'Set consent for the current user' })
  @UseInterceptors(UpsertUserInterceptor)
  @Post('consent')
  async giveConsent(@InjectUser() user: UserDocument): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.userService.giveConsent(user),
    );
  }

  @ApiProperty({ description: 'Get the current user' })
  @UseInterceptors(UpsertUserInterceptor)
  @Get('login')
  async login(@InjectUser() user: UserDocument): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(user);
  }

  @ApiProperty({ description: 'Update current company config' })
  @UseGuards(UserGuard)
  @Patch('config/company')
  async updateCompanyConfig(
    @InjectUser() user: UserDocument,
    @Body() config: UpdateApiCompanyConfigDto,
  ): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.companyUserService.updateCompanyConfig(user, config),
    );
  }

  @ApiProperty({ description: 'Create or update company preset' })
  @UseGuards(UserGuard)
  @Put('config/company/preset')
  async upsertCompanyPreset(
    @InjectUser() user: UserDocument,
    @Body() preset: ApiCompanyPresetDto,
  ): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.companyUserService.upsertCompanyPreset(user, preset),
    );
  }
}
