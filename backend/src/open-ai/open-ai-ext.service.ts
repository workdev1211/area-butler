import { Injectable } from '@nestjs/common';

import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { OpenAiApiService } from '../client/open-ai/open-ai-api.service';
import {
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
    } = openAiQueryParams;

    const place = await this.placeService.fetchPlaceOrFail({
      user,
      location: address || { lat, lng },
    });

    const coordinates = place.geometry.location;
    const resultAddress = address || place.formatted_address;

    const realEstate = this.generateRealEstate({
      energyEfficiency,
      furnishing,
      livingAreaInSqM,
      price,
      priceType,
      totalAreaInSqM,
      address: resultAddress,
    });

    let queryResp: string;

    switch (queryType) {
      case ApiOpenAiQueryTypesEnum.LOC_DESC:
      case ApiOpenAiQueryTypesEnum.LOC_EST_DESC: {
        const snapshotRes = await this.generateSnapshotRes({
          distance,
          place,
          transportMode,
          unit,
        });

        queryResp =
          queryType === ApiOpenAiQueryTypesEnum.LOC_DESC
            ? await this.openAiService.fetchLocDesc(user, {
                language,
                snapshotRes,
                tonality,
                meanOfTransportation: transportMode,
              })
            : await this.openAiService.fetchLocRealEstDesc(user, {
                language,
                realEstate,
                snapshotRes,
                tonality,
                meanOfTransportation: transportMode,
                realEstateType: defaultRealEstType,
              });

        break;
      }

      case ApiOpenAiQueryTypesEnum.EST_DESC: {
        queryResp = await this.openAiService.fetchRealEstDesc(user, {
          language,
          realEstate,
          tonality,
          realEstateType: realEstate.type || defaultRealEstType,
        });
      }
    }

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
    distance = DEFAULT_DISTANCE,
    transportMode = MeansOfTransportation.WALK,
    unit = ApiUnitsOfTransportEnum.MINUTES,
  }: {
    place: GeocodeResult;
    distance?: number;
    transportMode?: MeansOfTransportation;
    unit?: ApiUnitsOfTransportEnum;
  }): Promise<ApiSearchResultSnapshotResponse> {
    const coordinates = place.geometry.location;

    const poiData = await this.locationExtService.fetchPoiData({
      coordinates,
      distance,
      transportMode,
      unit,
    });

    return {
      config: { showAddress: false },
      snapshot: {
        location: coordinates,
        placesLocation: { label: place.formatted_address },
        searchResponse: {
          routingProfiles: {
            [transportMode]: { locationsOfInterest: poiData },
          },
        },
      },
    } as ApiSearchResultSnapshotResponse;
  }
}
