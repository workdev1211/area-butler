import { PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import ApiPropstackWebhookToAreaButlerDto from '../../real-estate-listing/dto/api-propstack-webhook-to-area-butler.dto';

@Exclude()
class ApiPropstackWebhookToAreaButlerUpdDto extends PartialType(
  ApiPropstackWebhookToAreaButlerDto,
) {}

export default ApiPropstackWebhookToAreaButlerUpdDto;
