import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Put,
  Query,
  Render,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { OnOfficeService } from './on-office.service';
import { activateUserPath } from './shared/on-office.constants';
import ApiOnOfficeUnlockProviderReqDto from './dto/api-on-office-unlock-provider-req.dto';
import ApiOnOfficeLoginReqDto from './dto/api-on-office-login-req.dto';
import {
  IApiOnOfficeActivationRes,
  IApiOnOfficeCreateOrderRes,
  TApiOnOfficeConfirmOrderRes,
} from '@area-butler-types/on-office';
import ApiOnOfficeCreateOrderReqDto from './dto/api-on-office-create-order-req.dto';
import ApiOnOfficeConfirmOrderReqDto from './dto/api-on-office-confirm-order-req.dto';
import { InjectUser } from '../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { VerifyOnOfficeActSignInterceptor } from './interceptor/verify-on-office-act-sign.interceptor';
import { VerifyOnOfficeSignatureInterceptor } from './interceptor/verify-on-office-signature.interceptor';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import ApiIntUpdEstTextFieldReqDto from '../dto/integration/api-int-upd-est-text-field-req.dto';
import { IApiIntUserLoginRes } from '@area-butler-types/integration-user';
import ApiOnOfficeActivationReqDto from './dto/api-on-office-activation-req.dto';
import ApiOnOfficeSyncEstatesFilterParamsDto from './dto/api-on-office-sync-estates-filter-params.dto';
import { RealEstateCrmImportService } from '../real-estate-listing/real-estate-crm-import.service';
import { IApiRealEstAvailIntStatuses } from '@area-butler-types/integration';
import ApiIntUploadEstateFileReqDto from '../dto/integration/api-int-upload-estate-file-req.dto';
// import ApiIntCreateEstateLinkReqDto from '../dto/integration/api-int-create-estate-link-req.dto';
import ApiIntSetPropPubLinksReqDto from '../dto/integration/api-int-set-prop-pub-links-req.dto';

@ApiTags('on-office')
@Controller('api/on-office')
export class OnOfficeController {
  private readonly logger = new Logger(OnOfficeController.name);

  constructor(
    private readonly onOfficeService: OnOfficeService,
    private readonly realEstateCrmImportService: RealEstateCrmImportService,
  ) {}

  // TODO think about moving this part to frontend, the user then should be created in the "unlockProvider" method
  @ApiOperation({ description: 'Renders the activation iFrame' })
  @UseInterceptors(VerifyOnOfficeActSignInterceptor)
  @Get('activation-iframe')
  @Render('on-office/activation-iframe')
  renderActivationIframe(
    @Query() activationData: ApiOnOfficeActivationReqDto,
  ): Promise<IApiOnOfficeActivationRes> {
    return this.onOfficeService.getRenderData(activationData);
  }

  @ApiOperation({ description: 'Activates user in the AreaButler app' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post(activateUserPath) // activate-user
  unlockProvider(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() unlockProviderData: ApiOnOfficeUnlockProviderReqDto,
  ): Promise<string> {
    return this.onOfficeService.unlockProvider(
      unlockProviderData,
      integrationUser,
    );
  }

  @ApiOperation({ description: 'Logs in the user' })
  @UseInterceptors(VerifyOnOfficeSignatureInterceptor)
  @Post('login')
  login(
    @Body() loginData: ApiOnOfficeLoginReqDto,
  ): Promise<IApiIntUserLoginRes> {
    this.logger.verbose(`'${this.login.name}' method was triggered.`, {
      ...loginData,
    });

    return this.onOfficeService.login(loginData);
  }

  @ApiOperation({ description: 'Creates an order' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('create-order')
  createOrder(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() createOrderData: ApiOnOfficeCreateOrderReqDto,
  ): Promise<IApiOnOfficeCreateOrderRes> {
    return this.onOfficeService.createOrder(createOrderData, integrationUser);
  }

  @ApiOperation({ description: 'Confirms an order' })
  @UseInterceptors(VerifyOnOfficeSignatureInterceptor)
  @Post('confirm-order')
  confirmOrder(
    @Body() confirmOrderData: ApiOnOfficeConfirmOrderReqDto,
  ): Promise<TApiOnOfficeConfirmOrderRes> {
    return this.onOfficeService.confirmOrder(confirmOrderData);
  }

  @ApiOperation({ description: 'Update estate text field value' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Patch('estate-text')
  updateEstateTextField(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() { exportType, integrationId, text }: ApiIntUpdEstTextFieldReqDto,
  ): Promise<void> {
    return this.onOfficeService.updateEstTextFields(
      integrationUser,
      integrationId,
      [{ exportType, text }],
    );
  }

  @ApiOperation({ description: 'Upload a file' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('estate-file')
  uploadEstateFile(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() uploadEstateFileDto: ApiIntUploadEstateFileReqDto,
  ): Promise<void> {
    return this.onOfficeService.uploadEstateFile(
      integrationUser,
      uploadEstateFileDto,
    );
  }

  // Reserved for possible future use
  // @ApiOperation({ description: 'Create a link' })
  // @UseInterceptors(InjectIntegrationUserInterceptor)
  // @Post('estate-link')
  // createEstateLink(
  //   @InjectUser() integrationUser: TIntegrationUserDocument,
  //   @Body() createEstateLinkDto: ApiIntCreateEstateLinkReqDto,
  // ): Promise<void> {
  //   return this.onOfficeService.createEstateLink(
  //     integrationUser,
  //     createEstateLinkDto,
  //   );
  // }

  @ApiOperation({ description: 'Fetch available estate statuses' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('avail-statuses')
  fetchAvailStatuses(
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<IApiRealEstAvailIntStatuses> {
    return this.onOfficeService.fetchAvailStatuses(integrationUser);
  }

  @ApiOperation({ description: 'Sync estate data' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put('sync-estates')
  syncEstateData(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    estateStatusParams: ApiOnOfficeSyncEstatesFilterParamsDto,
  ): Promise<string[]> {
    return this.realEstateCrmImportService.importFromOnOffice(
      integrationUser,
      estateStatusParams,
    );
  }

  @ApiOperation({ description: 'Set public links' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('property-public-links')
  setPropPublicLinks(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() setPropPubLinksReqDto: ApiIntSetPropPubLinksReqDto,
  ): Promise<void> {
    return this.onOfficeService.setPropPublicLinks(
      integrationUser,
      setPropPubLinksReqDto,
    );
  }
}
