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
import ApiPropstackWebhookPropertyDto from './dto/api-propstack-webhook-property.dto';
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
    propstackPropertyDto: ApiPropstackWebhookPropertyDto,
  ): Promise<void> {
    const nowDate = new Date();
    const eventId = `propertyCreated-${integrationUser.integrationUserId}-${
      propstackPropertyDto.id
    }-${nowDate.getTime()}`;

    this.logger.log(`Event ${eventId} has been triggered.`);

    void this.propstackWebhookService.handlePropertyCreated(
      integrationUser,
      propstackPropertyDto,
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
    propstackPropertyDto: ApiPropstackWebhookPropertyDto,
  ): Promise<void> {
    const nowDate = new Date();
    const eventId = `propertyUpdated-${integrationUser.integrationUserId}-${
      propstackPropertyDto.id
    }-${nowDate.getTime()}`;

    this.logger.log(`Event ${eventId} has been triggered.`);

    void this.propstackWebhookService.handlePropertyUpdated(
      integrationUser,
      propstackPropertyDto,
      eventId,
    );
  }
}
