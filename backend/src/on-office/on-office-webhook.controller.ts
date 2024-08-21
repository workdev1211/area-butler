import {
  Controller,
  Logger,
  Get,
  Query,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import ApiOnOfficeLoginQueryParamsDto from './dto/api-on-office-login-query-params.dto';
import { VerifyOnOfficeSignatureInterceptor } from './interceptor/verify-on-office-signature.interceptor';
import { OnOfficeWebhookService } from './on-office-webhook.service';
import { OnOfficeWebhookUrlEnum } from './shared/on-office.types';

@ApiTags('on-office', 'webhook')
@Controller('api/on-office-webhook')
export class OnOfficeWebhookController {
  private readonly logger = new Logger(OnOfficeWebhookController.name);

  constructor(
    private readonly onOfficeWebhookService: OnOfficeWebhookService,
  ) {}

  @ApiOperation({
    description: 'Process onOffice webhooks',
  })
  @UseInterceptors(VerifyOnOfficeSignatureInterceptor)
  @Get(':endpoint')
  handleWebhook(
    @Param('endpoint') endpoint: OnOfficeWebhookUrlEnum,
    @Query() onOfficeQueryParams: ApiOnOfficeLoginQueryParamsDto,
  ): void {
    this.logger.log(
      `\nWebhook: ${endpoint}` +
        `\nUser: ${onOfficeQueryParams.customerWebId}-${onOfficeQueryParams.userId}` +
        `\nEstate: ${onOfficeQueryParams.estateId}`,
    );

    void this.onOfficeWebhookService.handleWebhook(
      endpoint,
      onOfficeQueryParams,
    );
  }
}
