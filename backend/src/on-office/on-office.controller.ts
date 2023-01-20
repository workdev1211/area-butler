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

  @ApiOperation({ description: 'Renders the activation iFrame' })
  @Get('activation-iframe')
  @Render('on-office/activation-iframe')
  renderActivationIframe(
    @Query('apiToken') token: string,
    @Query('parameterCacheId') parameterCacheId: string,
    @Query('apiClaim') extendedClaim: string,
  ): IApiOnOfficeRenderData {
    this.logger.debug(
      JSON.stringify({ token, parameterCacheId, extendedClaim }),
    );

    return this.onOfficeService.getRenderData({
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
    this.logger.debug(JSON.stringify(unlockProviderData));
    const response = await this.onOfficeService.unlockProvider(
      unlockProviderData,
    );
    this.logger.debug(JSON.stringify(response));

    return 'active';
  }
}
