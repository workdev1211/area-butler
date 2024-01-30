import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import * as relativeTime from 'dayjs/plugin/relativeTime';

import { ApiUpsertRealEstateListing } from '@area-butler-types/real-estate';
import { IPropstackRealEstate } from '../shared/propstack.types';
import ApiPropstackToAreaButlerDto from '../real-estate-listing/dto/api-propstack-to-area-butler.dto';
import { createDirectLink } from '../shared/shared.functions';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { SnapshotExtService } from '../location/snapshot-ext.service';
import { PropstackApiService } from '../client/propstack/propstack-api.service';
import { MeansOfTransportation } from '@area-butler-types/types';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { LocationService } from '../location/location.service';
import { OpenAiTonalityEnum } from '@area-butler-types/open-ai';
import { defaultRealEstType } from '../../../shared/constants/open-ai';
import { defaultTargetGroupName } from '../../../shared/constants/potential-customer';
import { IApiIntUserPropstackParams } from '@area-butler-types/integration-user';
import ApiPropstackWebhookRealEstateDto from './dto/api-propstack-webhook-real-estate.dto';
import { PropstackService } from './propstack.service';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';

dayjs.extend(duration);
dayjs.extend(relativeTime);

@Injectable()
export class PropstackWebhookService {
  private readonly logger = new Logger(PropstackWebhookService.name);

  constructor(
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly locationService: LocationService,
    private readonly propstackApiService: PropstackApiService,
    private readonly propstackService: PropstackService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly snapshotExtService: SnapshotExtService,
  ) {}

  async handlePropertyCreated(
    user: UserDocument | TIntegrationUserDocument,
    { id }: ApiPropstackWebhookRealEstateDto,
    eventId: string,
  ): Promise<void> {
    let resultingUser = user;
    const isIntegrationUser = 'integrationUserId' in user;
    const propstackApiKey = isIntegrationUser
      ? (user.parameters as IApiIntUserPropstackParams).apiKey
      : user.apiConnections?.PROPSTACK.apiKey;

    // TODO remove the request by adding the complete validation of the required fields in the dto file
    const propstackRealEstate =
      await this.propstackApiService.fetchRealEstateById(propstackApiKey, id);

    const { address, department_id: departmentId } = propstackRealEstate;
    const place = await this.googleGeocodeService.fetchPlaceOrFail(address);

    Object.assign(propstackRealEstate, {
      address: address || place.formatted_address,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      },
    });

    if (isIntegrationUser) {
      resultingUser = await this.propstackService.getResultIntUser(
        user,
        departmentId,
      );

      const { integrationUserId, integrationType } = resultingUser;

      Object.assign(propstackRealEstate, {
        integrationParams: {
          integrationUserId,
          integrationType,
          integrationId: `${propstackRealEstate.id}`,
        },
      });
    }

    const areaButlerRealEstate = plainToInstance<
      ApiUpsertRealEstateListing,
      IPropstackRealEstate
    >(ApiPropstackToAreaButlerDto, propstackRealEstate);

    const realEstateListing = mapRealEstateListingToApiRealEstateListing(
      resultingUser,
      isIntegrationUser
        ? await this.realEstateListingIntService.upsertByIntParams(
            areaButlerRealEstate,
          )
        : await this.realEstateListingService.createRealEstateListing(
            user,
            areaButlerRealEstate,
          ),
    );

    const { id: searchResultSnapshotId, token } =
      await this.snapshotExtService.createSnapshotByPlace({
        place,
        realEstateListing,
        user: resultingUser,
      });

    this.logger.log(
      `Event id: ${eventId}. The event continues to be processed for ${dayjs
        .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
        .humanize()}. Snapshot creation is complete.`,
    );

    const fetchOpenAiDescription = async (
      fetchDescription: Promise<string>,
      descriptionName,
    ): Promise<{ [p: string]: string }> => {
      return { [descriptionName]: await fetchDescription };
    };

    const openAiQueryResults = await Promise.allSettled([
      fetchOpenAiDescription(
        this.locationService.fetchOpenAiLocationDescription(resultingUser, {
          searchResultSnapshotId,
          meanOfTransportation: MeansOfTransportation.WALK,
          targetGroupName: defaultTargetGroupName,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        }),
        'location_note',
      ),
      fetchOpenAiDescription(
        this.realEstateListingService.fetchOpenAiRealEstateDesc(resultingUser, {
          realEstateListingId: realEstateListing.id,
          realEstateType: defaultRealEstType,
          targetGroupName: defaultTargetGroupName,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        }),
        'description_note',
      ),
      fetchOpenAiDescription(
        this.locationService.fetchOpenAiLocRealEstDesc(resultingUser, {
          searchResultSnapshotId,
          meanOfTransportation: MeansOfTransportation.WALK,
          targetGroupName: defaultTargetGroupName,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
          realEstateListingId: realEstateListing.id,
          realEstateType: defaultRealEstType,
        }),
        'other_note',
      ),
    ]);

    this.logger.log(
      `Event id: ${eventId}. The event continues to be processed for ${dayjs
        .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
        .humanize()}. Fetching of OpenAi descriptions is complete.`,
    );

    const openAiDescriptions = openAiQueryResults.reduce<{
      [p: string]: string;
    }>((result, queryResult) => {
      if (queryResult.status === 'fulfilled') {
        Object.assign(result, { ...queryResult.value });
      } else {
        this.logger.error(
          `Event id: ${eventId}. The following error has occurred on fetching OpenAi descriptions: ${queryResult.reason}.`,
        );
      }

      return result;
    }, {});

    (
      await Promise.allSettled([
        this.propstackApiService.updateRealEstateById(propstackApiKey, id, {
          ...openAiDescriptions,
          // the old iframe link way - left just in case
          // custom_fields: {
          //   objekt_webseiten_url: createDirectLink(token),
          // },
        }),
        this.propstackApiService.createRealEstLink(propstackApiKey, {
          property_id: id,
          title: 'Interaktive Karte',
          url: createDirectLink(token),
          on_landing_page: true,
          is_embedable: true,
        }),
      ])
    ).forEach((response) => {
      if (response.status === 'rejected') {
        this.logger.error(
          `Event id: ${eventId}. The following error has occurred on Propstack property update: ${response.reason}.`,
        );
      }
    });

    this.logger.log(
      `Event id: ${eventId}. Event processing is complete and took ${dayjs
        .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
        .humanize()}.`,
    );
  }
}
