import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Render,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { OnOfficeService } from './on-office.service';
import { activateUserPath } from '../shared/on-office.constants';
import ApiOnOfficeUnlockProviderDto from './dto/api-on-office-unlock-provider.dto';
import ApiOnOfficeRequestParamsDto from './dto/api-on-office-request-params.dto';
import { IApiOnOfficeRenderData } from '@area-butler-types/on-office';
import ApiOnOfficeCreateOrderDto from './dto/api-on-office-create-order.dto';
import ApiOnOfficeConfirmOrderDto from './dto/api-on-office-confirm-order.dto';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';

@ApiTags('OnOffice')
@Controller('api/on-office')
export class OnOfficeController {
  private readonly logger = new Logger(OnOfficeController.name);

  constructor(private readonly onOfficeService: OnOfficeService) {}

  // TODO think about uniting the OnOffice React module with the current controller using the React Router
  @ApiOperation({ description: 'Renders the activation iFrame' })
  @Get('activation-iframe')
  @Render('on-office/activation-iframe')
  renderActivationIframe(
    @Query('userId') integrationUserId: string,
    @Query('apiToken') token: string,
    @Query('parameterCacheId') parameterCacheId: string,
    @Query('apiClaim') extendedClaim: string,
  ): Promise<IApiOnOfficeRenderData> {
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
    @Body() unlockProviderData: ApiOnOfficeUnlockProviderDto,
  ): Promise<string> {
    // TODO add signature verification?
    const response = await this.onOfficeService.unlockProvider(
      unlockProviderData,
    );

    return response?.status?.code === 200 &&
      response?.status?.errorcode === 0 &&
      response?.status?.message === 'OK'
      ? 'active'
      : 'error';
  }

  // @ApiOperation({ description: 'Verifies the OnOffice request signature' })
  // @Post('verify-signature')
  // verifySignature(
  //   @Body() onOfficeRequestParams: ApiOnOfficeRequestParamsDto,
  // ): boolean {
  //   return this.onOfficeService.verifySignature(onOfficeRequestParams);
  // }

  @ApiOperation({ description: 'Logs in the user' })
  @Post('login')
  login(
    @Body() onOfficeRequestParams: ApiOnOfficeRequestParamsDto,
  ): Promise<any> {
    return this.onOfficeService.login(onOfficeRequestParams);
  }

  @ApiOperation({ description: 'Creates an order' })
  @Post('create-order')
  createOrder(
    @Body() createOrderData: ApiOnOfficeCreateOrderDto,
  ): Promise<any> {
    return this.onOfficeService.createOrder(createOrderData);
  }

  @ApiOperation({ description: 'Confirms an order' })
  @Post('confirm-order')
  confirmOrder(
    @Body() confirmOrderData: ApiOnOfficeConfirmOrderDto,
  ): Promise<any> {
    return this.onOfficeService.confirmOrder(confirmOrderData);
  }

  // TODO add dto
  @ApiOperation({
    description: 'Fetches or creates a snapshot by real estate address',
  })
  @Post('find-create-snapshot')
  async findOrCreateSnapshot(
    @Body() findOrCreateData: any,
  ): Promise<ApiSearchResultSnapshotResponse> {
    // TODO add user id to body
    return this.onOfficeService.findOrCreateSnapshot(findOrCreateData);
  }
}
