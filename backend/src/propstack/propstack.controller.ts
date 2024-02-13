import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PropstackService } from './propstack.service';
import { PropstackConnectGuard } from '../auth/propstack-connect.guard';
import ApiPropstackConnectReqDto from './dto/api-propstack-connect-req.dto';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { InjectUser } from '../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import ApiPropstackLoginReqDto from './dto/api-propstack-login-req.dto';
import { IApiIntUserLoginRes } from '@area-butler-types/integration-user';
import { RealEstateCrmImportService } from '../real-estate-listing/real-estate-crm-import.service';
import { IApiRealEstAvailIntStatuses } from '@area-butler-types/integration';
import { InjectPropstackLoginUserInterceptor } from './interceptor/inject-propstack-login-user.interceptor';
import ApiPropstackSyncEstatesReqDto from './dto/api-propstack-sync-estates-req.dto';
import ApiPropstackUpdPropTextFieldReqDto from './dto/api-propstack-upd-prop-text-field-req.dto';

@ApiTags('propstack')
@Controller('api/propstack')
export class PropstackController {
  private readonly logger = new Logger(PropstackController.name);

  constructor(
    private readonly propstackService: PropstackService,
    private readonly realEstateCrmImportService: RealEstateCrmImportService,
  ) {}

  @ApiOperation({ description: 'Connect a Propstack user' })
  @Post('connect')
  @UseGuards(PropstackConnectGuard)
  @HttpCode(HttpStatus.CREATED)
  connect(@Body() connectData: ApiPropstackConnectReqDto): Promise<void> {
    this.logger.debug(
      `'${this.connect.name}' method was triggered.`,
      connectData,
    );

    return this.propstackService.connect(connectData);
  }

  @ApiOperation({ description: 'Log in a Propstack user' })
  @UseInterceptors(InjectPropstackLoginUserInterceptor)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() loginData: ApiPropstackLoginReqDto,
  ): Promise<IApiIntUserLoginRes> {
    this.logger.debug(`'${this.login.name}' method was triggered.`, {
      integrationUserId: integrationUser.integrationUserId,
      ...loginData,
    });

    return this.propstackService.login(integrationUser, loginData);
  }

  @ApiOperation({ description: 'Update property text field value' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Patch('property-text/:propertyId')
  updatePropertyTextField(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('propertyId', new ParseIntPipe()) propertyId: number,
    @Body() updatePropTextFieldDto: ApiPropstackUpdPropTextFieldReqDto,
  ): Promise<void> {
    return this.propstackService.updatePropertyTextField(
      integrationUser,
      propertyId,
      updatePropTextFieldDto,
    );
  }

  @ApiOperation({ description: 'Fetch available estate statuses' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('avail-statuses')
  fetchAvailStatuses(
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<IApiRealEstAvailIntStatuses> {
    return this.propstackService.fetchAvailStatuses(integrationUser);
  }

  @ApiOperation({ description: 'Sync estate data' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put('sync-estates')
  syncEstateData(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    syncEstatesReqDto: ApiPropstackSyncEstatesReqDto,
  ): Promise<string[]> {
    return this.realEstateCrmImportService.importFromPropstack(
      integrationUser,
      syncEstatesReqDto,
    );
  }
}
