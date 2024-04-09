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
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import * as relativeTime from 'dayjs/plugin/relativeTime';

import { InjectUser } from '../user/inject-user.decorator';
import ApiPropstackWebhookPropertyDto from './dto/api-propstack-webhook-property.dto';
import { PropstackWebhookService } from './propstack-webhook.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { PropstackWebhookIntGuard } from '../auth/propstack-webhook-int.guard';

dayjs.extend(duration);
dayjs.extend(relativeTime);

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
    const eventId = `propertyCreated-user(${
      integrationUser.integrationUserId
    })-${propstackPropertyDto.id}-${nowDate.getTime()}`;

    this.logger.verbose(`Event ${eventId} was triggered.`);

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
    const eventId = `propertyUpdated-user(${
      integrationUser.integrationUserId
    })-${propstackPropertyDto.id}-${nowDate.getTime()}`;

    this.logger.verbose(`Event ${eventId} was triggered.`);

    void this.propstackWebhookService
      .handlePropertyUpdated(integrationUser, propstackPropertyDto)
      .then(() => {
        this.logger.verbose(
          `Event ${eventId} processing is complete and took ${dayjs
            .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
            .humanize()}.`,
        );
      });
  }
}
