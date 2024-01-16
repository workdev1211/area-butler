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
import ApiPropstackWebhookRealEstateDto from './dto/api-propstack-webhook-real-estate.dto';
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
    propstackRealEstDto: ApiPropstackWebhookRealEstateDto,
  ): Promise<void> {
    const nowDate = new Date();
    const eventId = `${user.id}-${propstackRealEstDto.id}-${nowDate.getTime()}`;

    this.logger.log(
      `Event id: ${eventId}. ${this.handlePropertyCreated.name} method has been triggered.`,
    );

    void this.propstackWebhookService.handlePropertyCreated(
      user,
      propstackRealEstDto,
      eventId,
    );
  }
}
