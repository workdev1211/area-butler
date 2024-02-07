import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import ApiPropstackWebhookPropertyDto from './dto/api-propstack-webhook-property.dto';
import { PropstackWebhookService } from './propstack-webhook.service';

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

    this.logger.log(`Event ${eventId} has been triggered.`);

    void this.propstackWebhookService.handlePropertyCreated(
      user,
      propstackPropertyDto,
      eventId,
    );
  }
}
