import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
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
import ApiOnOfficeUplEstFileOrLinkReqDto from './dto/api-on-office-upl-est-file-or-link-req.dto';
import ApiOnOfficeUpdEstTextFieldReqDto from './dto/api-on-office-upd-est-text-field-req.dto';
import {
  AreaButlerExportTypesEnum,
  IApiIntUserLoginRes,
} from '@area-butler-types/integration-user';
import ApiOnOfficeActivationReqDto from './dto/api-on-office-activation-req.dto';
import ApiOnOfficeSyncEstatesFilterParamsDto from './dto/api-on-office-sync-estates-filter-params.dto';
import { RealEstateCrmImportService } from '../real-estate-listing/real-estate-crm-import.service';
import { IApiRealEstAvailIntStatuses } from '@area-butler-types/integration';

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
    this.logger.debug(this.login.name, loginData);
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

  @ApiOperation({ description: 'Update an estate' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Patch('estate-text/:integrationId')
  updateEstateTextField(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('integrationId') integrationId: string,
    @Body() updateEstateTextFieldData: ApiOnOfficeUpdEstTextFieldReqDto,
  ): Promise<void> {
    return this.onOfficeService.updateEstateTextField(
      integrationUser,
      integrationId,
      updateEstateTextFieldData,
    );
  }

  @ApiOperation({ description: 'Upload a file' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('estate-file/:integrationId')
  uploadEstateFileOrLink(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('integrationId') integrationId: string,
    @Body() uploadEstateFileOrLinkData: ApiOnOfficeUplEstFileOrLinkReqDto,
  ): Promise<void> {
    if (
      [
        AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS,
        AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS,
      ].includes(
        uploadEstateFileOrLinkData.exportType as AreaButlerExportTypesEnum,
      )
    ) {
      return this.onOfficeService.uploadEstateLink(
        integrationUser,
        integrationId,
        uploadEstateFileOrLinkData,
      );
    }

    return this.onOfficeService.uploadEstateFile(
      integrationUser,
      integrationId,
      uploadEstateFileOrLinkData,
    );
  }

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
}
