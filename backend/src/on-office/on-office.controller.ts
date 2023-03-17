import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
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
  IApiOnOfficeLoginRes,
  IApiOnOfficeActivationRes,
  IApiOnOfficeCreateOrderRes,
  IApiOnOfficeConfirmOrderRes,
} from '@area-butler-types/on-office';
import ApiOnOfficeCreateOrderReqDto from './dto/api-on-office-create-order-req.dto';
import ApiOnOfficeConfirmOrderReqDto from './dto/api-on-office-confirm-order-req.dto';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import ApiOnOfficeFindCreateSnapshotReqDto from './dto/api-on-office-find-create-snapshot-req.dto';
import { InjectUser } from '../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { VerifyOnOfficeActSignInterceptor } from './interceptor/verify-on-office-act-sign.interceptor';
import { VerifyOnOfficeSignatureInterceptor } from './interceptor/verify-on-office-signature.interceptor';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';

@ApiTags('OnOffice')
@Controller('api/on-office')
export class OnOfficeController {
  private readonly logger = new Logger(OnOfficeController.name);

  constructor(private readonly onOfficeService: OnOfficeService) {}

  // TODO think about uniting the OnOffice React module with the current controller using the React Router
  @ApiOperation({ description: 'Renders the activation iFrame' })
  @UseInterceptors(VerifyOnOfficeActSignInterceptor)
  @Get('activation-iframe')
  @Render('on-office/activation-iframe')
  renderActivationIframe(
    @Query('userId') integrationUserId: string,
    @Query('apiToken') token: string,
    @Query('parameterCacheId') parameterCacheId: string,
    @Query('apiClaim') extendedClaim: string,
  ): Promise<IApiOnOfficeActivationRes> {
    return this.onOfficeService.getRenderData({
      integrationUserId,
      token,
      parameterCacheId,
      extendedClaim,
    });
  }

  @ApiOperation({ description: 'Activates user in the AreaButler app' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post(activateUserPath)
  async unlockProvider(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() unlockProviderData: ApiOnOfficeUnlockProviderReqDto,
  ): Promise<string> {
    this.logger.debug(this.unlockProvider.name, unlockProviderData);

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
  ): Promise<IApiOnOfficeLoginRes> {
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
    this.logger.debug(this.createOrder.name, createOrderData);
    return this.onOfficeService.createOrder(createOrderData, integrationUser);
  }

  @ApiOperation({ description: 'Confirms an order' })
  @UseInterceptors(
    VerifyOnOfficeSignatureInterceptor,
    InjectIntegrationUserInterceptor,
  )
  @Post('confirm-order')
  confirmOrder(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() confirmOrderData: ApiOnOfficeConfirmOrderReqDto,
  ): Promise<IApiOnOfficeConfirmOrderRes> {
    this.logger.debug(this.confirmOrder.name, confirmOrderData);
    return this.onOfficeService.confirmOrder(confirmOrderData, integrationUser);
  }

  @ApiOperation({
    description: 'Fetches or creates a snapshot by real estate address',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('find-create-snapshot')
  async findOrCreateSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() findOrCreateSnapshotData: ApiOnOfficeFindCreateSnapshotReqDto,
  ): Promise<ApiSearchResultSnapshotResponse | any> {
    this.logger.debug(this.findOrCreateSnapshot.name, findOrCreateSnapshotData);

    return this.onOfficeService.getEstateData(
      findOrCreateSnapshotData.estateId,
      integrationUser,
    );

    // return this.onOfficeService.findOrCreateSnapshot(
    //   findOrCreateSnapshotData,
    //   this.integrationType,
    // );
  }
}
