import { Injectable } from '@nestjs/common';

import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { OpenAiApiService } from '../client/open-ai/open-ai-api.service';
import {
  ApiBcp47LanguageEnum,
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCostType,
  ApiRealEstateListing,
} from '@area-butler-types/real-estate';
import {
  ApiOpenAiQueryTypesEnum,
  ApiUnitsOfTransportEnum,
  IOpenAiExtQueryReq,
} from '../shared/types/external-api';
import { PlaceService } from '../place/place.service';
import { defaultRealEstType } from '../../../shared/constants/open-ai';
import { LocationExtService } from '../location/location-ext.service';
import {
  ApiCoordinates,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
} from '@area-butler-types/types';
import { OpenAiService } from './open-ai.service';
import { DEFAULT_DISTANCE } from '../location/dto/api-fetch-poi-data-req.dto';
import { GeocodeResult } from '@googlemaps/google-maps-services-js';
import { PotentialCustomerDocument } from '../potential-customer/schema/potential-customer.schema';
import { OpenAiTonalityEnum } from '@area-butler-types/open-ai';

const MAX_DISTANCE_IN_METERS = 25000; // 60 minutes by car

@Injectable()
export class OpenAiExtService {
  constructor(
    private readonly locationExtService: LocationExtService,
    private readonly openAiApiService: OpenAiApiService,
    private readonly openAiService: OpenAiService,
    private readonly placeService: PlaceService,
  ) {}

  async fetchExtQuery(
    user: UserDocument | TIntegrationUserDocument,
    openAiQueryParams: IOpenAiExtQueryReq,
  ): Promise<{ coordinates: ApiCoordinates; queryResp: string }> {
    const {
      queryType,
      tonality,
      maxTextLength,
      language,
      lat,
      lng,
      address,
      transportMode,
      distance,
      unit,
      price,
      priceType,
      livingAreaInSqM,
      totalAreaInSqM,
      energyEfficiency,
      furnishing,
      customText,
    } = openAiQueryParams;

    const place = await this.placeService.fetchPlaceOrFail({
      user,
      location: address || { lat, lng },
    });

    const coordinates = place.geometry.location;
    const resultAddress = address || place.formatted_address;
    const snapshotRes =
      [
        ApiOpenAiQueryTypesEnum.LOC_DESC,
        ApiOpenAiQueryTypesEnum.LOC_EST_DESC,
        ApiOpenAiQueryTypesEnum.DISTRICT_DESC,
      ].includes(queryType) &&
      (await this.generateSnapshotRes({
        distance,
        place,
        transportMode,
        unit,
      }));

    const realEstate =
      [
        ApiOpenAiQueryTypesEnum.EST_DESC,
        ApiOpenAiQueryTypesEnum.LOC_EST_DESC,
      ].includes(queryType) &&
      this.generateRealEstate({
        energyEfficiency,
        furnishing,
        livingAreaInSqM,
        price,
        priceType,
        totalAreaInSqM,
        address: resultAddress,
      });

    let queryResp = await this.generateText({
      user,
      queryType,
      realEstate,
      snapshotRes,
      language,
      tonality,
      transportMode,
      customText,
    });

    if (queryResp.length > maxTextLength) {
      const query =
        `Fasse den folgenden Text so zusammen, dass er nicht länger als ${maxTextLength} Zeichen lang ist! Lasse die Tonalität hierbei unverändert.\n` +
        (language ? ` Verwende als Ausgabesprache ${language} (BCP 47).` : '') +
        queryResp;

      queryResp = await this.openAiApiService.fetchResponse(query);
    }

    return {
      coordinates,
      queryResp,
    };
  }

  generateText({
    user,
    queryType,
    realEstate,
    snapshotRes,
    language,
    tonality,
    transportMode,
    customText,
  }: {
    user: UserDocument | TIntegrationUserDocument;
    queryType: ApiOpenAiQueryTypesEnum;
    realEstate?: ApiRealEstateListing;
    snapshotRes: ApiSearchResultSnapshotResponse;
    language?: ApiBcp47LanguageEnum;
    tonality?: OpenAiTonalityEnum;
    transportMode?: MeansOfTransportation;
    customText?: string;
  }): Promise<string> {
    const params = {
      language,
      realEstate,
      snapshotRes,
      tonality,
      meanOfTransportation: transportMode,
      realEstateType: (realEstate && realEstate.type) || defaultRealEstType,
      customText,
    };
    switch (queryType) {
      case ApiOpenAiQueryTypesEnum.LOC_DESC:
        return this.openAiService.fetchLocDesc(user, params);
      case ApiOpenAiQueryTypesEnum.DISTRICT_DESC:
        return this.openAiService.fetchDistrictDesc(user, params);
      case ApiOpenAiQueryTypesEnum.LOC_EST_DESC:
        return this.openAiService.fetchLocRealEstDesc(user, params);
      case ApiOpenAiQueryTypesEnum.EST_DESC:
        return this.openAiService.fetchRealEstDesc(user, params);
    }
  }

  // only parameters used in 'OpenAiQueryService' are present
  generateRealEstate({
    address,
    energyEfficiency,
    furnishing,
    livingAreaInSqM,
    price,
    priceType,
    totalAreaInSqM,
  }: {
    address: string;
    energyEfficiency?: ApiEnergyEfficiency;
    furnishing?: ApiFurnishing[];
    livingAreaInSqM?: number;
    price?: number;
    priceType?: ApiRealEstateCostType;
    totalAreaInSqM?: number;
  }): ApiRealEstateListing {
    return {
      address,
      characteristics: {
        energyEfficiency,
        furnishing,
        propertySizeInSquareMeters: totalAreaInSqM,
        realEstateSizeInSquareMeters: livingAreaInSqM,
      },
      costStructure: {
        price: { amount: price, currency: '€' },
        type: priceType,
      },
    } as ApiRealEstateListing;
  }

  // only parameters used in 'OpenAiQueryService' are present
  async generateSnapshotRes({
    place,
    potentialCustomer,
    distance = DEFAULT_DISTANCE,
    transportMode = MeansOfTransportation.WALK,
    unit = ApiUnitsOfTransportEnum.MINUTES,
  }: {
    place: GeocodeResult;
    distance?: number;
    potentialCustomer?: Partial<PotentialCustomerDocument>;
    transportMode?: MeansOfTransportation;
    unit?: ApiUnitsOfTransportEnum;
  }): Promise<ApiSearchResultSnapshotResponse> {
    const coordinates = place.geometry.location;

    const snapshotRes = {
      config: { showAddress: false },
      snapshot: {
        location: coordinates,
        placesLocation: { label: place.formatted_address },
        searchResponse: {
          routingProfiles: {},
        },
      },
    } as ApiSearchResultSnapshotResponse;

    const setRoutingProfiles = async (
      distance: number,
      transportMode: MeansOfTransportation,
      unit: ApiUnitsOfTransportEnum,
    ): Promise<void> => {
      const poiData = await this.locationExtService.fetchPoiData({
        coordinates,
        distance,
        transportMode,
        unit,
        maxDistanceInMeters: MAX_DISTANCE_IN_METERS,
      });

      Object.assign(snapshotRes.snapshot.searchResponse.routingProfiles, {
        [transportMode]: { locationsOfInterest: poiData },
      });
    };

    if (potentialCustomer) {
      snapshotRes.snapshot.preferredLocations =
        potentialCustomer.preferredLocations;

      for (const { amount, type, unit } of potentialCustomer.routingProfiles) {
        await setRoutingProfiles(amount, type, ApiUnitsOfTransportEnum[unit]);
      }
    } else {
      await setRoutingProfiles(distance, transportMode, unit);
    }

    return snapshotRes;
  }
}
