import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import ApiPropstackWebhookRealEstateDto from './dto/api-propstack-webhook-real-estate.dto';
import { PropstackWebhookService } from './propstack-webhook.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { PropstackWebhookIntGuard } from '../auth/propstack-webhook-int.guard';

@ApiTags('propstack', 'webhook', 'integration')
@UseGuards(PropstackWebhookIntGuard)
@Controller('api/propstack-webhook-int')
export class PropstackWebhookIntController {
  private readonly logger = new Logger(PropstackWebhookIntController.name);

  constructor(
    private readonly propstackWebhookService: PropstackWebhookService,
  ) {}

  @ApiOperation({
    description: 'Process a Propstack webhook on event "Property created"',
  })
  @Post('property-created')
  @HttpCode(HttpStatus.OK)
  async handlePropertyCreated(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    propstackRealEstDto: ApiPropstackWebhookRealEstateDto,
  ): Promise<void> {
    const nowDate = new Date();
    const integrationUserId = integrationUser.integrationUserId;
    const eventId = `propertyCreated-${integrationUserId}-${
      propstackRealEstDto.id
    }-${nowDate.getTime()}`;
    this.logger.log(
      `Event ${eventId} has been triggered.`,
      propstackRealEstDto,
    );

    void this.propstackWebhookService.handlePropertyCreated(
      integrationUser,
      propstackRealEstDto,
      eventId,
    );
  }

  @ApiOperation({
    description: 'Process a Propstack webhook on event "Property updated"',
  })
  @Post('property-updated')
  @HttpCode(HttpStatus.OK)
  async handlePropertyUpdated(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    propstackRealEstDto: ApiPropstackWebhookRealEstateDto,
  ): Promise<void> {
    const nowDate = new Date();
    const integrationUserId = integrationUser.integrationUserId;
    const eventId = `propertyUpdated-${integrationUserId}-${
      propstackRealEstDto.id
    }-${nowDate.getTime()}`;
    this.logger.log(
      `Event ${eventId} has been triggered.`,
      propstackRealEstDto,
    );

    void this.propstackWebhookService.handlePropertyUpdated(
      integrationUser,
      propstackRealEstDto,
      eventId,
    );
  }
}
