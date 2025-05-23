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
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import {
  IPropstackLink,
  IPropstackProperty,
  IPropstackWebhookProperty,
} from '../shared/types/propstack';
import ApiPropstackWebhookToAreaButlerDto from '../real-estate-listing/dto/api-propstack-webhook-to-area-butler.dto';
import ApiPropstackWebhookToAreaButlerUpdDto from './dto/api-propstack-webhook-to-area-butler-upd.dto';
import { PlaceService } from '../place/place.service';
import {
  AreaButlerExportTypesEnum,
  MeansOfTransportation,
  ResultStatusEnum,
} from '@area-butler-types/types';
import {
  OpenAiService,
  TFetchLocRealEstDescParams,
} from '../open-ai/open-ai.service';
import { PropstackTextFieldTypeEnum } from '@area-butler-types/propstack';
import { propstackOpenAiFieldMapper } from '../../../shared/constants/propstack/propstack-constants';
import {
  OpenAiQueryTypeEnum,
  TOpenAiLocDescType,
} from '@area-butler-types/open-ai';
import { defaultRealEstType } from '../../../shared/constants/open-ai';
import { PropstackService } from './propstack.service';
import { TUpdEstTextFieldParams } from '@area-butler-types/integration';

dayjs.extend(duration);
dayjs.extend(relativeTime);

@Injectable()
export class PropstackWebhookService {
  private readonly logger = new Logger(PropstackWebhookService.name);

  constructor(
    private readonly openAiService: OpenAiService,
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
      : user.config.externalConnections?.PROPSTACK.apiKey;

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

    if (isIntegrationUser && !user.subscription) {
      return;
    }

    const snapshotResponse =
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
    const defaultParams = {
      meanOfTransportation: MeansOfTransportation.WALK,
      realEstateId: realEstateListing.id,
      realEstateType: defaultRealEstType,
      snapshotId: snapshotResponse.id,
    };

    const requiredLocDescTypes = (
      [
        OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
      ] as TOpenAiLocDescType[]
    ).reduce((res, type) => {
      const preset = user.company?.config?.presets?.[type];

      res.set(type, {
        ...defaultParams,
        ...(preset?.general as Record<string, unknown>),
        ...(preset?.locationDescription as Record<string, unknown>),
        ...(preset?.realEstateType as Record<string, unknown>),
        realEstateId: defaultParams.realEstateId,
        snapshotId: defaultParams.snapshotId,
      });

      return res;
    }, new Map<TOpenAiLocDescType, TFetchLocRealEstDescParams>());

    const openAiDescs = await this.openAiService.batchFetchLocDescs(
      user,
      defaultParams,
      requiredLocDescTypes,
    );

    const propstackTextFields: TUpdEstTextFieldParams[] = Object.entries(
      openAiDescs,
    ).map(([openAiLocDescType, locDesc]) => ({
      exportType: openAiLocDescType as TOpenAiLocDescType,
      text: locDesc,
    }));

    const promises: Promise<void | IPropstackLink>[] = [];

    const linkWithAddressExportMatching =
      user.company.config?.exportMatching?.[
        AreaButlerExportTypesEnum.LINK_WITH_ADDRESS
      ];
    const linkWithoutAddressExportMatching =
      user.company.config?.exportMatching?.[
        AreaButlerExportTypesEnum.LINK_WO_ADDRESS
      ];

    if (linkWithAddressExportMatching?.fieldId) {
      propstackTextFields.push({
        exportType: AreaButlerExportTypesEnum.LINK_WITH_ADDRESS,
        text: createDirectLink(snapshotResponse, true),
      });
    } else {
      promises.push(
        this.propstackApiService.createPropertyLink(propstackApiKey, {
          property_id: resultProperty.id,
          title: 'Interaktive Karte',
          url: createDirectLink(snapshotResponse, true),
          on_landing_page: !!linkWithAddressExportMatching?.onLandingPage,
          is_embedable: !!linkWithAddressExportMatching?.isEmbedable,
          is_private: linkWithAddressExportMatching?.isPrivate ?? true,
        }),
      );
    }

    if (linkWithoutAddressExportMatching?.fieldId) {
      propstackTextFields.push({
        exportType: AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
        text: createDirectLink(snapshotResponse, false),
      });
    } else {
      promises.push(
        this.propstackApiService.createPropertyLink(propstackApiKey, {
          property_id: resultProperty.id,
          title: 'Interaktive Karte - anonym',
          url: createDirectLink(snapshotResponse, false),
          on_landing_page: linkWithAddressExportMatching?.onLandingPage ?? true,
          is_embedable: linkWithAddressExportMatching?.isEmbedable ?? true,
          is_private: !!linkWithAddressExportMatching?.isPrivate,
        }),
      );
    }

    promises.push(
      this.propstackService.updatePropTextFields(
        user as TIntegrationUserDocument,
        String(resultProperty.id),
        propstackTextFields,
      ),
    );

    (await Promise.allSettled(promises)).forEach((response) => {
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
