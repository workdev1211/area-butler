import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { LeanDocument } from 'mongoose';

import {
  ApiCoordinates,
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
import ApiRealEstateListingDto from '../../dto/api-real-estate-listing.dto';
import ApiSearchResultSnapshotConfigDto from './snapshot/api-search-result-snapshot-config.dto';

export type TSnapshotResDtoData = LeanDocument<SearchResultSnapshotDocument> & {
  isEmbedded?: boolean;
  isTrial?: boolean;
  realEstateListing?: ApiRealEstateListing;
  userPoiIcons?: IApiUserPoiIcons;
};

let randomCoordinates: ApiCoordinates;

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
  token: string;

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
  @Type(() => ApiRealEstateListingDto)
  @Transform(
    ({
      value,
      obj: {
        isEmbedded = false,
        config: { showAddress = false },
      },
    }: {
      obj: TSnapshotResDtoData;
      value: ApiRealEstateListing;
    }): ApiRealEstateListing =>
      processAddressVisibility(value, showAddress, isEmbedded),
    {
      toClassOnly: true,
    },
  )
  realEstateListing?: ApiRealEstateListing;

  @Expose()
  updatedAt?: Date;

  @Expose()
  visitAmount?: number;

  constructor() {
    randomCoordinates = undefined;
  }
}

export default ApiSearchResultSnapshotResponseDto;

const processAddressVisibility = <
  T extends ApiSearchResultSnapshot | ApiRealEstateListing,
>(
  entity: T,
  isAddressShown: boolean,
  isEmbedded: boolean,
): T => {
  if (!entity || isAddressShown || !isEmbedded) {
    return entity;
  }

  const isSnapshot = 'searchResponse' in entity;

  randomCoordinates =
    randomCoordinates ||
    randomizeCoordinates(isSnapshot ? entity.location : entity.coordinates);

  if (!isSnapshot) {
    return {
      ...entity,
      address: undefined,
      coordinates: randomCoordinates,
    };
  }

  const processSearchRes: ApiSearchResponse = {
    ...entity.searchResponse,
    centerOfInterest: {
      coordinates: randomCoordinates,
      address: undefined,
      distanceInMeters: 0,
      entity: undefined,
    },
  };

  return {
    ...entity,
    location: randomCoordinates,
    placesLocation: undefined,
    searchResponse: processSearchRes,
  };
};
