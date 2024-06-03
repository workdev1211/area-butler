import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PropstackService } from './propstack.service';
import { PropstackConnectGuard } from '../auth/propstack/propstack-connect.guard';
import ApiPropstackConnectReqDto from './dto/api-propstack-connect-req.dto';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { InjectUser } from '../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import ApiPropstackLoginReqDto from './dto/api-propstack-login-req.dto';
import { IApiIntUserLoginRes } from '@area-butler-types/integration-user';
import { RealEstateCrmImportService } from '../real-estate-listing/real-estate-crm-import.service';
import { IApiRealEstAvailIntStatuses } from '@area-butler-types/integration';
import { InjectPropstackLoginUserInterceptor } from './interceptor/inject-propstack-login-user.interceptor';
import ApiPropstackSyncPropertiesReqDto from './dto/api-propstack-sync-properties-req.dto';
import ApiIntUploadEstateFileReqDto from '../dto/integration/api-int-upload-estate-file-req.dto';
// import ApiIntCreateEstateLinkReqDto from '../dto/integration/api-int-create-estate-link-req.dto';
// import { IPropstackLink } from '../shared/types/propstack';
import ApiPropstackUpdPropTextFieldReqDto from './dto/api-propstack-upd-prop-text-field-req.dto';
import ApiIntSetPropPubLinksReqDto from '../dto/integration/api-int-set-prop-pub-links-req.dto';

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
    this.logger.verbose(
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
    this.logger.verbose(`'${this.login.name}' method was triggered.`, {
      integrationUserId: integrationUser.integrationUserId,
      ...loginData,
    });

    return this.propstackService.login(integrationUser, loginData);
  }

  // Left just in case of possible future usage
  // @ApiOperation({ description: 'Handle a target group change' })
  // @UseInterceptors(InjectPropstackLoginUserInterceptor)
  // @Patch('target-group')
  // @HttpCode(HttpStatus.OK)
  // handleTargetGroupChanged(
  //   @InjectUser() integrationUser: TIntegrationUserDocument,
  //   @Body() targetGroupData: ApiPropstackTargetGroupChangedReqDto,
  // ): Promise<void> {
  //   this.logger.verbose(
  //     `'${this.handleTargetGroupChanged.name}' method was triggered.`,
  //     {
  //       integrationUserId: integrationUser.integrationUserId,
  //       ...targetGroupData,
  //     },
  //   );
  //
  //   return this.propstackService.handleTargetGroupChanged(
  //     integrationUser,
  //     targetGroupData,
  //   );
  // }

  // Reserved for possible future use
  // @ApiOperation({ description: 'Create property link' })
  // @UseInterceptors(InjectIntegrationUserInterceptor)
  // @Post('property-link')
  // createPropertyLink(
  //   @InjectUser() integrationUser: TIntegrationUserDocument,
  //   @Body() createEstateLinkDto: ApiIntCreateEstateLinkReqDto,
  // ): Promise<IPropstackLink> {
  //   return this.propstackService.createPropertyLink(
  //     integrationUser,
  //     createEstateLinkDto,
  //   );
  // }

  @ApiOperation({ description: 'Upload property image' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('property-image')
  uploadPropertyImage(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() uploadEstateFileDto: ApiIntUploadEstateFileReqDto,
  ): Promise<void> {
    return this.propstackService.uploadPropertyImage(
      integrationUser,
      uploadEstateFileDto,
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

  @ApiOperation({ description: 'Update property text field value' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Patch('property-text')
  updatePropertyTextField(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() updEstTextFieldDto: ApiPropstackUpdPropTextFieldReqDto,
  ): Promise<void> {
    return this.propstackService.updatePropertyTextField(
      integrationUser,
      updEstTextFieldDto,
    );
  }

  @ApiOperation({ description: 'Sync estate data' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put('sync-estates')
  syncEstateData(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    syncEstatesReqDto: ApiPropstackSyncPropertiesReqDto,
  ): Promise<string[]> {
    return this.realEstateCrmImportService.importFromPropstack(
      integrationUser,
      syncEstatesReqDto,
    );
  }

  @ApiOperation({ description: 'Set public links' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('property-public-links')
  setPropPublicLinks(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() setPropPubLinksReqDto: ApiIntSetPropPubLinksReqDto,
  ): Promise<void> {
    return this.propstackService.setPropPublicLinks(
      integrationUser,
      setPropPubLinksReqDto,
    );
  }
}
