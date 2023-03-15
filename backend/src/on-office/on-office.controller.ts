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
import { activateUserPath } from '../shared/on-office.constants';
import ApiOnOfficeUnlockProviderReqDto from './dto/api-on-office-unlock-provider-req.dto';
import ApiOnOfficeLoginReqDto from './dto/api-on-office-login-req.dto';
import {
  IApiOnOfficeLoginRes,
  IApiOnOfficeActivationRes,
} from '@area-butler-types/on-office';
import ApiOnOfficeCreateOrderReqDto from './dto/api-on-office-create-order-req.dto';
import ApiOnOfficeConfirmOrderReqDto from './dto/api-on-office-confirm-order-req.dto';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import ApiOnOfficeFindCreateSnapshotReqDto from './dto/api-on-office-find-create-snapshot-req.dto';
import { InjectIntegrationUserInterceptor } from './interceptor/inject-integration-user.interceptor';
import { VerifyActivationSignatureInterceptor } from './interceptor/verify-activation-signature.interceptor';
import { VerifySignatureInterceptor } from './interceptor/verify-signature.interceptor';
import { InjectUser } from '../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

@ApiTags('OnOffice')
@Controller('api/on-office')
export class OnOfficeController {
  private readonly logger = new Logger(OnOfficeController.name);

  constructor(private readonly onOfficeService: OnOfficeService) {}

  // TODO think about uniting the OnOffice React module with the current controller using the React Router
  @ApiOperation({ description: 'Renders the activation iFrame' })
  @UseInterceptors(VerifyActivationSignatureInterceptor)
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
  @Post(activateUserPath)
  async unlockProvider(
    @Body() unlockProviderData: ApiOnOfficeUnlockProviderReqDto,
  ): Promise<string> {
    this.logger.debug(this.unlockProvider.name, unlockProviderData);

    // TODO add signature verification
    const response = await this.onOfficeService.unlockProvider(
      unlockProviderData,
    );

    return response?.status?.code === 200 &&
      response?.status?.errorcode === 0 &&
      response?.status?.message === 'OK'
      ? 'active'
      : 'error';
  }

  @ApiOperation({ description: 'Logs in the user' })
  @UseInterceptors(VerifySignatureInterceptor)
  @Post('login')
  login(
    @Body() loginData: ApiOnOfficeLoginReqDto,
  ): Promise<IApiOnOfficeLoginRes> {
    this.logger.debug(this.login.name, loginData);
    return this.onOfficeService.login(loginData);
  }

  // TODO add a verification interceptor
  @ApiOperation({ description: 'Creates an order' })
  @Post('create-order')
  createOrder(
    @Body() createOrderData: ApiOnOfficeCreateOrderReqDto,
  ): Promise<any> {
    this.logger.debug(this.createOrder.name, createOrderData);
    return this.onOfficeService.createOrder(createOrderData);
  }

  @ApiOperation({ description: 'Confirms an order' })
  @Post('confirm-order')
  confirmOrder(
    @Body() confirmOrderData: ApiOnOfficeConfirmOrderReqDto,
  ): Promise<any> {
    this.logger.debug(this.confirmOrder.name, confirmOrderData);
    return this.onOfficeService.confirmOrder(confirmOrderData);
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
    return this.onOfficeService.test(findOrCreateSnapshotData, integrationUser);

    // return this.onOfficeService.findOrCreateSnapshot(
    //   findOrCreateSnapshotData,
    //   this.integrationType,
    // );
  }
}
