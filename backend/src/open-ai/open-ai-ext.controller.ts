import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { OpenAiService } from './open-ai.service';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import ApiQueryOpenAiExtReqDto from './dto/api-query-open-ai-ext-req.dto';
import { LocationExtService } from '../location/location-ext.service';
import { ApiRequestStatusesEnum } from '@area-butler-types/types';
import {
  ApiOpenAiQueryTypesEnum,
  ApiUsageStatsTypesEnum,
  IApiQueryOpenAiExtReqStatus,
  IApiQueryOpenAiExtRes,
} from '../shared/types/external-api';
import {
  defaultRealEstType,
  openAiTonalities,
} from '../../../shared/constants/open-ai';
import { GoogleApiService } from '../client/google/google-api.service';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import { UsageStatisticsService } from '../user/usage-statistics.service';
import { SearchResultSnapshotDocument } from '../location/schema/search-result-snapshot.schema';

@ApiTags('open-ai', 'api')
@Controller('api/open-ai-ext')
export class OpenAiExtController extends ApiKeyAuthController {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly locationExtService: LocationExtService,
    private readonly googleApiService: GoogleApiService,
    private readonly usageStatisticsService: UsageStatisticsService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Fetch Open AI response' })
  @Get('query')
  async fetchResponse(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query()
    queryOpenAiRes: ApiQueryOpenAiExtReqDto,
  ): Promise<IApiQueryOpenAiExtRes | string> {
    const {
      queryType,
      tonality,
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
    } = queryOpenAiRes;

    const requestStatus: IApiQueryOpenAiExtReqStatus = {
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: queryOpenAiRes,
    };

    try {
      // TODO move all complex logic to a separate OpenAI service
      const place = await this.googleApiService.fetchPlaceOrFail(
        address || { lat, lng },
      );

      const coordinates = place.geometry.location;
      const resultingAddress = address || place.formatted_address;
      const resultingTonality = openAiTonalities[tonality];

      const realEstateListing: Partial<IApiRealEstateListingSchema> = {
        address: resultingAddress,
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
      };

      let query: string;

      switch (queryType) {
        case ApiOpenAiQueryTypesEnum.LOC_DESC:
        case ApiOpenAiQueryTypesEnum.LOC_EST_DESC: {
          const poiData = await this.locationExtService.fetchPoiData({
            transportMode,
            distance,
            unit,
            coordinates,
          });

          const searchResultSnapshot = {
            snapshot: {
              location: coordinates,
              placesLocation: { label: resultingAddress },
              searchResponse: {
                routingProfiles: {
                  [transportMode]: { locationsOfInterest: poiData },
                },
              },
            },
          } as SearchResultSnapshotDocument;

          query =
            queryType === ApiOpenAiQueryTypesEnum.LOC_DESC
              ? await this.openAiService.getLocDescQuery(user, {
                  searchResultSnapshot,
                  meanOfTransportation: transportMode,
                  tonality: resultingTonality,
                })
              : await this.openAiService.getLocRealEstDescQuery(user, {
                  realEstateListing,
                  realEstateType: defaultRealEstType,
                  searchResultSnapshot,
                  meanOfTransportation: transportMode,
                  tonality: resultingTonality,
                });

          break;
        }

        case ApiOpenAiQueryTypesEnum.EST_DESC: {
          query = this.openAiService.getRealEstDescQuery({
            realEstateListing,
            realEstateType: defaultRealEstType,
            tonality: resultingTonality,
          });
        }
      }

      Object.assign(requestStatus, { coordinates });

      return {
        input: { coordinates },
        result: await this.openAiService.fetchResponse(query),
      };
    } catch (e) {
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
      requestStatus.message = e.message;

      if (e.response?.status === 429 && !(e instanceof HttpException)) {
        throw new HttpException(
          'Too many requests at a time! Please, try again later.',
          429,
        );
      }

      throw e;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.POI_DATA,
        requestStatus,
      );
    }
  }
}
