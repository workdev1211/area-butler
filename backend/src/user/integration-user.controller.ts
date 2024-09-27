import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

import { ApiTourNamesEnum } from '@area-butler-types/types';
import { InjectIntegrationUserInterceptor } from './interceptor/inject-integration-user.interceptor';
import { InjectUser } from './inject-user.decorator';
import { IntegrationUserService } from './integration-user.service';
import { IApiIntegrationUser } from '@area-butler-types/integration-user';
import ApiUserConfigDto from './dto/api-user-config.dto';
import { TIntegrationUserDocument } from './schema/integration-user.schema';
import { ConvertIntUserService } from './convert-int-user.service';

@ApiTags('users', 'integration')
@Controller('api/integration-users')
export class IntegrationUserController {
  constructor(
    private readonly convertIntUserService: ConvertIntUserService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  @ApiProperty({ description: 'Hide single tour for current integration user' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('hide-tour/:tour')
  async hideTour(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('tour') tour: ApiTourNamesEnum,
  ): Promise<IApiIntegrationUser> {
    return this.convertIntUserService.convertDocToApiIntUser(
      await this.integrationUserService.hideTour(integrationUser, tour),
    );
  }

  @ApiProperty({ description: 'Hide tours for current integration user' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('hide-tour')
  async hideAllTours(
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<IApiIntegrationUser> {
    return this.convertIntUserService.convertDocToApiIntUser(
      await this.integrationUserService.hideTour(integrationUser),
    );
  }

  @ApiProperty({ description: 'Update current user config' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Patch('config')
  async updateConfig(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() config: ApiUserConfigDto,
  ): Promise<IApiIntegrationUser> {
    return this.convertIntUserService.convertDocToApiIntUser(
      await this.integrationUserService.updateConfig(integrationUser, config),
    );
  }
}
