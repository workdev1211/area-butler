import { Injectable } from '@nestjs/common';

import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { OpenAiApiService } from '../client/open-ai/open-ai-api.service';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import {
  ApiOpenAiQueryTypesEnum,
  IOpenAiExtQueryReq,
} from '../shared/types/external-api';
import { PlaceService } from '../place/place.service';
import { defaultRealEstType } from '../../../shared/constants/open-ai';
import { LocationExtService } from '../location/location-ext.service';
import {
  ApiCoordinates,
  ApiSearchResultSnapshotResponse,
} from '@area-butler-types/types';
import { OpenAiService } from './open-ai.service';

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
      housingArea: realEstateSizeInSquareMeters,
      totalArea: propertySizeInSquareMeters,
      energyEfficiency,
      furnishing,
    } = openAiQueryParams;

    const place = await this.placeService.fetchPlaceOrFail({
      user,
      location: address || { lat, lng },
    });

    const coordinates = place.geometry.location;
    const resultAddress = address || place.formatted_address;

    const realEstate = {
      address: resultAddress,
      characteristics: {
        realEstateSizeInSquareMeters,
        propertySizeInSquareMeters,
        energyEfficiency,
        furnishing,
      },
      costStructure: {
        price: { amount: price, currency: '€' },
        type: priceType,
      },
    } as ApiRealEstateListing;

    let queryResp: string;

    switch (queryType) {
      case ApiOpenAiQueryTypesEnum.LOC_DESC:
      case ApiOpenAiQueryTypesEnum.LOC_EST_DESC: {
        const poiData = await this.locationExtService.fetchPoiData({
          transportMode,
          distance,
          unit,
          coordinates,
        });

        const snapshotRes = {
          snapshot: {
            location: coordinates,
            placesLocation: { label: resultAddress },
            searchResponse: {
              routingProfiles: {
                [transportMode]: { locationsOfInterest: poiData },
              },
            },
          },
        } as ApiSearchResultSnapshotResponse;

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
          realEstateType: defaultRealEstType,
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
}
