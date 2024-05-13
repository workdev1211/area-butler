import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import * as relativeTime from 'dayjs/plugin/relativeTime';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import ApiPropstackWebhookPropertyDto from './dto/api-propstack-webhook-property.dto';
import { PropstackWebhookService } from './propstack-webhook.service';

dayjs.extend(duration);
dayjs.extend(relativeTime);

@ApiTags('propstack', 'webhook')
@Controller('api/propstack-webhook')
export class PropstackWebhookController extends ApiKeyAuthController {
  private readonly logger = new Logger(PropstackWebhookController.name);

  constructor(
    private readonly propstackWebhookService: PropstackWebhookService,
  ) {
    super();
  }

  @ApiOperation({
    description: 'Process a Propstack webhook on event "Property created"',
  })
  @Post('property-created')
  @HttpCode(HttpStatus.OK)
  async handlePropertyCreated(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    propstackPropertyDto: ApiPropstackWebhookPropertyDto,
  ): Promise<void> {
    const nowDate = new Date();
    const eventId = `propertyCreated-${user.id}-${
      propstackPropertyDto.id
    }-${nowDate.getTime()}`;

    this.logger.log(`Event ${eventId} was triggered.`);
    this.logger.verbose(propstackPropertyDto);

    void this.propstackWebhookService
      .handlePropertyCreated(user, propstackPropertyDto, eventId)
      .then(() => {
        this.logger.log(
          `Event ${eventId} processing is complete and took ${dayjs
            .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
            .humanize()}.`,
        );
      });
  }

  @ApiOperation({
    description: 'Process a Propstack webhook on event "Property updated"',
  })
  @Post('property-updated')
  @HttpCode(HttpStatus.OK)
  async handlePropertyUpdated(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    propstackPropertyDto: ApiPropstackWebhookPropertyDto,
  ): Promise<void> {
    const nowDate = new Date();
    const eventId = `propertyUpdated-${user.id}-${
      propstackPropertyDto.id
    }-${nowDate.getTime()}`;

    this.logger.log(`Event ${eventId} was triggered.`);
    this.logger.verbose(propstackPropertyDto);

    void this.propstackWebhookService
      .handlePropertyUpdated(user, propstackPropertyDto)
      .then(() => {
        this.logger.log(
          `Event ${eventId} processing is complete and took ${dayjs
            .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
            .humanize()}.`,
        );
      });
  }
}
