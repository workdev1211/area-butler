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
import { IApiOnOfficeRenderData } from '../shared/on-office.types';

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
    @Query('userId') userId: string,
    @Query('apiToken') token: string,
    @Query('parameterCacheId') parameterCacheId: string,
    @Query('apiClaim') extendedClaim: string,
  ): Promise<IApiOnOfficeRenderData> {
    this.logger.debug({
      method: this.renderActivationIframe.name,
      userId,
      token,
      parameterCacheId,
      extendedClaim,
    });

    return this.onOfficeService.getRenderData({
      userId,
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
    this.logger.debug({
      method: this.unlockProvider.name,
      unlockProviderData,
    });

    const response = await this.onOfficeService.unlockProvider(
      unlockProviderData,
    );

    return response?.status?.code === 200 &&
      response?.status?.errorcode === 0 &&
      response?.status?.message === 'OK'
      ? 'active'
      : 'error';
  }
}
