import { Body, Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { ApiTourNamesEnum } from '@area-butler-types/types';
import { InjectIntegrationUserInterceptor } from './interceptor/inject-integration-user.interceptor';
import { InjectUser } from './inject-user.decorator';
import { IntegrationUserService } from './integration-user.service';
import { IApiIntegrationUser } from '@area-butler-types/integration-user';
import ApiIntegrationUserDto from './dto/api-integration-user.dto';
import ApiIntegrationUserConfigDto from './dto/api-integration-user-config.dto';

@ApiTags('users', 'integration')
@Controller('api/integration-users')
export class IntegrationUserController {
  constructor(
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  @ApiProperty({ description: 'Hide tours for current integration user' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('me/hide-tour')
  async hideAllTours(
    @InjectUser() integrationUser,
  ): Promise<IApiIntegrationUser> {
    return plainToInstance(
      ApiIntegrationUserDto,
      await this.integrationUserService.hideTour(integrationUser),
    );
  }

  @ApiProperty({ description: 'Hide single tour for current integration user' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('me/hide-tour/:tour')
  async hideTour(
    @InjectUser() integrationUser,
    @Param('tour') tour: ApiTourNamesEnum,
  ): Promise<IApiIntegrationUser> {
    return plainToInstance(
      ApiIntegrationUserDto,
      await this.integrationUserService.hideTour(integrationUser, tour),
    );
  }

  @ApiProperty({ description: "Update the user's config" })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('update-config')
  async updateConfig(
    @InjectUser() integrationUser,
    @Body() config: ApiIntegrationUserConfigDto,
  ): Promise<IApiIntegrationUser> {
    return plainToInstance(
      ApiIntegrationUserDto,
      await this.integrationUserService.updateConfig(integrationUser, config),
    );
  }
}
