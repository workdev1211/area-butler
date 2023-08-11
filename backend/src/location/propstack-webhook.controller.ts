import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import { SnapshotExtService } from './snapshot-ext.service';
import { PropstackApiService } from '../client/propstack/propstack-api.service';
import { createDirectLink } from '../shared/shared.functions';
import ApiPropstackWebhookRealEstateDto from './dto/api-propstack-webhook-real-estate.dto';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import ApiPropstackToAreaButlerDto from '../real-estate-listing/dto/api-propstack-to-area-butler.dto';
import { ApiUpsertRealEstateListing } from '@area-butler-types/real-estate';
import { IPropstackRealEstate } from '../shared/propstack.types';

@ApiTags('propstack', 'webhook')
@Controller('api/propstack-webhook')
export class PropstackWebhookController extends ApiKeyAuthController {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly snapshotExtService: SnapshotExtService,
    private readonly propstackApiService: PropstackApiService,
  ) {
    super();
  }

  @ApiOperation({
    description: 'Process a Propstack webhook on event "Property created"',
  })
  @Post('property-created')
  async processPropertyCreated(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    { id, address }: ApiPropstackWebhookRealEstateDto,
  ): Promise<void> {
    const {
      token,
      snapshot: {
        placesLocation,
        location: { lat, lng },
      },
    } = await this.snapshotExtService.createSnapshot({
      user,
      location: address,
    });

    const propstackApiKey = user.apiConnections?.PROPSTACK.apiKey;

    if (!propstackApiKey) {
      return;
    }

    const propstackRealEstate =
      await this.propstackApiService.fetchRealEstateById(propstackApiKey, id);

    Object.assign(propstackRealEstate, {
      address: placesLocation.label || propstackRealEstate.address,
      lat,
      lng,
    });

    const areaButlerRealEstate = plainToInstance<
      ApiUpsertRealEstateListing,
      IPropstackRealEstate
    >(ApiPropstackToAreaButlerDto, propstackRealEstate, {
      exposeUnsetFields: false,
    });

    await this.realEstateListingService.createRealEstateListing(
      user,
      areaButlerRealEstate,
    );

    await this.propstackApiService.updateRealEstateById(propstackApiKey, id, {
      custom_fields: {
        objekt_webseiten_url: createDirectLink(token),
      },
    });
  }
}
