import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Document } from 'mongoose';

import {
  ApiCoordinates,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  IApiPoiIcons,
} from '@area-butler-types/types';
import { SearchResultSnapshotDocument } from '../schema/search-result-snapshot.schema';
import { randomizeCoordinates } from '../../../../shared/functions/shared.functions';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import ApiSearchResultSnapshotDto from './snapshot/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotConfigDto from './snapshot/api-search-result-snapshot-config.dto';
import ApiRealEstateListingDto from '../../dto/api-real-estate-listing.dto';

export type TSnapshotResDtoData = SearchResultSnapshotDocument & {
  isAddressShown?: boolean;
  isEmbedded?: boolean;
  isTrial?: boolean;
  poiIcons?: IApiPoiIcons;
};

interface IProcessAddrVisParams<
  T extends ApiRealEstateListing | ApiSearchResultSnapshot,
> {
  entity: T;
  isAddressShown: boolean;
  isEmbedded: boolean;
  isSnapshot?: boolean;
}

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
      obj: { config, isAddressShown, isEmbedded = false },
    }: {
      obj: TSnapshotResDtoData;
      value: ApiSearchResultSnapshot;
    }): ApiSearchResultSnapshot =>
      processAddressVisibility<ApiSearchResultSnapshot>({
        isEmbedded,
        entity: value,
        isAddressShown:
          isEmbedded && typeof isAddressShown === 'boolean'
            ? isAddressShown
            : !!config?.showAddress,
        isSnapshot: true,
      }),
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
  isTrial?: boolean;

  @Expose()
  lastAccess?: Date;

  @Expose()
  @Type(() => ApiRealEstateListingDto)
  @Transform(
    ({
      value,
      obj: { config, isAddressShown, isEmbedded = false },
    }: {
      obj: TSnapshotResDtoData;
      value: ApiRealEstateListing;
    }): ApiRealEstateListing =>
      value
        ? processAddressVisibility<ApiRealEstateListing>({
            isEmbedded,
            entity: value,
            isAddressShown:
              isEmbedded && typeof isAddressShown === 'boolean'
                ? isAddressShown
                : !!config?.showAddress,
          })
        : undefined,
    {
      toClassOnly: true,
    },
  )
  realEstate?: ApiRealEstateListing;

  // 'obj' processing is required, the real estate id is changed when using 'value'
  @Expose()
  @Transform(
    ({ obj: { realEstateId } }: { obj: TSnapshotResDtoData }): string =>
      realEstateId ? `${realEstateId}` : undefined,
    {
      toClassOnly: true,
    },
  )
  realEstateId?: string;

  @Expose()
  token?: string;

  @Expose()
  updatedAt?: Date;

  @Expose()
  visitAmount?: number;

  constructor() {
    randomCoordinates = undefined;
  }
}

export default ApiSearchResultSnapshotResponseDto;

let randomCoordinates: ApiCoordinates;

const processAddressVisibility = <
  T extends ApiRealEstateListing | ApiSearchResultSnapshot,
>({
  entity,
  isAddressShown,
  isEmbedded,
  isSnapshot,
}: IProcessAddrVisParams<T>): T => {
  if (!entity || isAddressShown || !isEmbedded) {
    return entity;
  }

  if (!randomCoordinates) {
    randomCoordinates = randomizeCoordinates(
      isSnapshot
        ? (entity as ApiSearchResultSnapshot).location
        : (entity as ApiRealEstateListing).coordinates,
    );
  }

  if (!isSnapshot) {
    return {
      ...entity,
      address: undefined,
      coordinates: randomCoordinates,
    };
  }

  const resultSnapshot: T = {
    ...entity,
    location: randomCoordinates,
    placesLocation: undefined,
  };

  let searchResponse: ApiSearchResponse;

  if ((entity as ApiSearchResultSnapshot).searchResponse) {
    searchResponse = {
      ...(entity as ApiSearchResultSnapshot).searchResponse,
      centerOfInterest: {
        coordinates: randomCoordinates,
        address: undefined,
        distanceInMeters: 0,
        entity: undefined,
      },
    };

    Object.assign(resultSnapshot, { searchResponse });
  }

  return resultSnapshot;
};
