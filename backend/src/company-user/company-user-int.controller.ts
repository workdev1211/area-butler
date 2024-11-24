import { Body, Controller, Patch, Put, UseInterceptors } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

import { CompanyUserService } from './company-user.service';
import { InjectUser } from '../user/inject-user.decorator';
import UpdateApiCompanyConfigDto from '../company/dto/update-api-company-config.dto';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IApiIntegrationUser } from '@area-butler-types/integration-user';
import { ConvertIntUserService } from '../user/service/convert-int-user.service';
import ApiCompanyPresetDto from '../company/dto/api-company-preset.dto';

@ApiTags('company', 'user', 'integration')
@Controller('api/company-user-int')
export class CompanyUserIntController {
  constructor(
    private readonly companyUserService: CompanyUserService,
    private readonly convertIntUserService: ConvertIntUserService,
  ) {}

  @ApiProperty({ description: 'Update current company config' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Patch('config/company')
  async updateCompanyConfig(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() config: UpdateApiCompanyConfigDto,
  ): Promise<IApiIntegrationUser> {
    return this.convertIntUserService.convertDocToApiIntUser(
      await this.companyUserService.updateCompanyConfig(
        integrationUser,
        config,
      ),
    );
  }

  @ApiProperty({ description: 'Create or update company preset' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put('config/company/preset')
  async upsertCompanyPreset(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() preset: ApiCompanyPresetDto,
  ): Promise<IApiIntegrationUser> {
    return this.convertIntUserService.convertDocToApiIntUser(
      await this.companyUserService.upsertCompanyPreset(
        integrationUser,
        preset,
      ),
    );
  }
}
