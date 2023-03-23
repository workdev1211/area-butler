import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
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
  TApiOnOfficeConfirmOrderRes,
} from '@area-butler-types/on-office';
import ApiOnOfficeCreateOrderReqDto from './dto/api-on-office-create-order-req.dto';
import ApiOnOfficeConfirmOrderReqDto from './dto/api-on-office-confirm-order-req.dto';
import { InjectUser } from '../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { VerifyOnOfficeActSignInterceptor } from './interceptor/verify-on-office-act-sign.interceptor';
import { VerifyOnOfficeSignatureInterceptor } from './interceptor/verify-on-office-signature.interceptor';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import ApiOnOfficeUpdateEstateReqDto from './dto/api-on-office-update-estate-req.dto';

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
  @Post('estate/:integrationId')
  updateEstate(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('integrationId') integrationId: string,
    @Body() updateEstateData: ApiOnOfficeUpdateEstateReqDto,
  ): Promise<void> {
    return this.onOfficeService.updateEstate(
      integrationUser,
      integrationId,
      updateEstateData,
    );
  }
}
