import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { LeanDocument } from 'mongoose';

import {
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  IApiUserPoiIcons,
} from '@area-butler-types/types';
import { SearchResultSnapshotDocument } from '../schema/search-result-snapshot.schema';
import { randomizeCoordinates } from '../../../../shared/functions/shared.functions';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import ApiSearchResultSnapshotDto from './snapshot/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotConfigDto from './snapshot/api-search-result-snapshot-config.dto';

export type TSnapshotResDtoData = LeanDocument<SearchResultSnapshotDocument> & {
  isEmbedded?: boolean;
  isTrial?: boolean;
  realEstateListing?: ApiRealEstateListing;
  userPoiIcons?: IApiUserPoiIcons;
};

@Exclude()
class ApiSearchResultSnapshotResponseDto
  implements ApiSearchResultSnapshotResponse
{
  @Expose()
  @Transform(
    ({ obj: { _id } }: { obj: TSnapshotResDtoData }): string => `${_id}`,
    {
      toClassOnly: true,
    },
  )
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  mapboxAccessToken: string;

  @Expose()
  @Type(() => ApiSearchResultSnapshotDto)
  @Transform(
    ({
      value,
      obj: {
        isEmbedded = false,
        config: { showAddress = false },
      },
    }: {
      obj: TSnapshotResDtoData;
      value: ApiSearchResultSnapshot;
    }): ApiSearchResultSnapshot =>
      processAddressVisibility(value, showAddress, isEmbedded),
    {
      toClassOnly: true,
    },
  )
  snapshot: ApiSearchResultSnapshot;

  @Expose()
  addressToken: string;

  @Expose()
  unaddressToken: string;

  @Expose()
  @Type(() => ApiSearchResultSnapshotConfigDto)
  config?: ApiSearchResultSnapshotConfig;

  @Expose()
  description?: string;

  @Expose()
  endsAt?: Date;

  @Expose()
  iframeEndsAt?: Date;

  @Expose()
  @Transform(
    ({ obj: { integrationParams } }: { obj: TSnapshotResDtoData }): string =>
      integrationParams?.integrationId,
    {
      toClassOnly: true,
    },
  )
  integrationId?: string;

  @Expose()
  isTrial?: boolean;

  @Expose()
  lastAccess?: Date;

  @Expose()
  token?: string;

  @Expose()
  updatedAt?: Date;

  @Expose()
  visitAmount?: number;
}

export default ApiSearchResultSnapshotResponseDto;

const processAddressVisibility = (
  snapshot: ApiSearchResultSnapshot,
  isAddressShown: boolean,
  isEmbedded: boolean,
): ApiSearchResultSnapshot => {
  if (!snapshot || isAddressShown || !isEmbedded) {
    return snapshot;
  }

  const { location, realEstate, searchResponse, ...otherSnapshotData } =
    snapshot;

  const randomCoordinates = randomizeCoordinates(location);

  const processedSearchRes: ApiSearchResponse = {
    ...searchResponse,
    centerOfInterest: {
      coordinates: randomCoordinates,
      address: undefined,
      distanceInMeters: 0,
      entity: undefined,
    },
  };

  const resultRealEstate: ApiRealEstateListing = realEstate
    ? { ...realEstate }
    : undefined;

  if (resultRealEstate) {
    resultRealEstate.address = undefined;
    resultRealEstate.coordinates = undefined;
  }

  return {
    ...otherSnapshotData,
    location: randomCoordinates,
    placesLocation: undefined,
    realEstate: resultRealEstate,
    searchResponse: processedSearchRes,
  };
};
