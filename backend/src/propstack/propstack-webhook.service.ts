import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import * as relativeTime from 'dayjs/plugin/relativeTime';

import {
  ApiRealEstateExtSourcesEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { createDirectLink } from '../shared/functions/shared';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { SnapshotExtService } from '../location/snapshot-ext.service';
import { PropstackApiService } from '../client/propstack/propstack-api.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { IApiIntUserPropstackParams } from '@area-butler-types/integration-user';
import ApiPropstackWebhookPropertyDto from './dto/api-propstack-webhook-property.dto';
import { PropstackService } from './propstack.service';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { IPropstackWebhookProperty } from '../shared/types/propstack';
import ApiPropstackWebhookToAreaButlerDto from '../real-estate-listing/dto/api-propstack-webhook-to-area-butler.dto';
import ApiPropstackWebhookToAreaButlerUpdDto from './dto/api-propstack-webhook-to-area-butler-upd.dto';
import { PlaceService } from '../place/place.service';
import { ResultStatusEnum } from '@area-butler-types/types';

dayjs.extend(duration);
dayjs.extend(relativeTime);

@Injectable()
export class PropstackWebhookService {
  private readonly logger = new Logger(PropstackWebhookService.name);

  constructor(
    private readonly placeService: PlaceService,
    private readonly propstackApiService: PropstackApiService,
    private readonly propstackService: PropstackService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly snapshotExtService: SnapshotExtService,
  ) {}

  async handlePropertyCreated(
    user: UserDocument | TIntegrationUserDocument,
    property: ApiPropstackWebhookPropertyDto,
    eventId: string,
  ): Promise<void> {
    const isIntegrationUser = 'integrationUserId' in user;
    const propstackApiKey = isIntegrationUser
      ? (user.parameters as IApiIntUserPropstackParams).apiKey
      : user.apiConnections?.PROPSTACK.apiKey;

    const place = await this.placeService.fetchPlaceOrFail({
      isNotLimitCountries: true,
      location: property.address,
    });

    const resultProperty = { ...property };

    Object.assign(resultProperty, {
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      },
    });

    if (isIntegrationUser) {
      Object.assign(resultProperty, {
        integrationParams: {
          integrationUserId: user.integrationUserId,
          integrationType: user.integrationType,
          integrationId: `${resultProperty.id}`,
        },
      });
    }

    const realEstateDto = plainToInstance<
      IApiRealEstateListingSchema,
      IPropstackWebhookProperty
    >(ApiPropstackWebhookToAreaButlerDto, resultProperty);

    const realEstateListing = mapRealEstateListingToApiRealEstateListing(
      user,
      isIntegrationUser
        ? await this.realEstateListingIntService.upsertOneByIntParams(
            realEstateDto,
          )
        : await this.realEstateListingService.createRealEstateListing(
            user,
            realEstateDto,
          ),
    );

    if (
      !PlaceService.checkIsCountryAllowed(
        user,
        place,
        this.handlePropertyCreated.name,
      )
    ) {
      return;
    }

    if (isIntegrationUser && !user.isSubscriptionActive) {
      return;
    }

    const { id: snapshotId, token } =
      await this.snapshotExtService.createSnapshotByPlace({
        place,
        realEstateListing,
        user,
      });

    this.logger.verbose(
      `Event ${eventId} continues to be processed for ${dayjs
        .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
        .humanize()}. Snapshot creation is complete.`,
    );

    if (
      property.description_note ||
      property.location_note ||
      property.other_note
    ) {
      return;
    }

    const openAiDescriptions = await this.propstackService.fetchTextFieldValues(
      {
        eventId,
        snapshotId,
        user,
        realEstateId: realEstateListing.id,
      },
    );

    (
      await Promise.allSettled([
        this.propstackApiService.updatePropertyById(
          propstackApiKey,
          resultProperty.id,
          {
            ...openAiDescriptions,
            // the old iframe link way - left just in case
            // custom_fields: {
            //   objekt_webseiten_url: createDirectLink(token),
            // },
          },
        ),
        this.propstackApiService.createPropertyLink(propstackApiKey, {
          property_id: resultProperty.id,
          title: 'Interaktive Karte',
          url: createDirectLink(token),
          on_landing_page: true,
          is_embedable: true,
        }),
      ])
    ).forEach((response) => {
      if (response.status === 'rejected') {
        this.logger.error(
          `Event ${eventId}. The following error has occurred on Propstack property update: ${response.reason}.`,
        );
        this.logger.debug(response.reason);
      }
    });
  }

  async handlePropertyUpdated(
    user: UserDocument | TIntegrationUserDocument,
    property: ApiPropstackWebhookPropertyDto,
  ): Promise<ResultStatusEnum> {
    const changedAttributes = property.changed_attributes?.split(',');

    if (!changedAttributes) {
      return;
    }

    const resultProperty: Partial<IPropstackWebhookProperty> =
      changedAttributes.reduce((result, attrName) => {
        const attrValue = property[attrName];

        if (attrValue) {
          result[attrName] = attrValue;
        }

        return result;
      }, {});

    if (!Object.keys(resultProperty).length) {
      return;
    }

    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      Object.assign(resultProperty, {
        userId: user.id,
        externalSource: ApiRealEstateExtSourcesEnum.PROPSTACK,
        externalId: property.id,
      });
    }

    if (isIntegrationUser) {
      Object.assign(resultProperty, {
        integrationParams: {
          integrationUserId: user.integrationUserId,
          integrationType: user.integrationType,
          integrationId: `${property.id}`,
        },
      });
    }

    if (resultProperty.address) {
      const {
        geometry: {
          location: { lat, lng },
        },
      } = await this.placeService.fetchPlaceOrFail({
        isNotLimitCountries: true,
        location: resultProperty.address,
      });

      Object.assign(resultProperty, {
        location: {
          type: 'Point',
          coordinates: [lat, lng],
        },
      });
    }

    const realEstate = plainToInstance<
      Partial<IApiRealEstateListingSchema>,
      Partial<IPropstackWebhookProperty>
    >(ApiPropstackWebhookToAreaButlerUpdDto, resultProperty, {
      exposeUnsetFields: false,
    });

    // TODO make 'furnishing' completely optional
    // needed because furnishing should not be empty on real estate creation
    if (
      Object.keys(realEstate.characteristics).length === 1 &&
      'furnishing' in realEstate.characteristics &&
      !realEstate.characteristics.furnishing.length
    ) {
      delete realEstate.characteristics;
    }

    return isIntegrationUser
      ? await this.realEstateListingIntService.bulkUpdateOneByIntParams(
          realEstate,
        )
      : await this.realEstateListingService.bulkUpdateOneByExtParams(
          realEstate,
        );
  }
}
