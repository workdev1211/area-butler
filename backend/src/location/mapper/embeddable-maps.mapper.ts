import { SearchResultSnapshotDocument } from '../schema/search-result-snapshot.schema';
import { RealEstateListingDocument } from '../../real-estate-listing/schema/real-estate-listing.schema';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import ApiSearchResultSnapshotDto from '../../dto/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotConfigDto from '../../dto/api-search-result-snapshot-config.dto';
import ApiCoordinatesDto from '../../dto/api-coordinates.dto';
import ApiSearchResponseDto from '../../dto/api-search-response.dto';
import {
  ApiSearchResultSnapshotResponse,
  IApiUserPoiIcons,
} from '@area-butler-types/types';
import { randomizeCoordinates } from '../../../../shared/functions/shared.functions';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';

export const mapSnapshotToEmbeddableMap = (
  searchResultSnapshot: SearchResultSnapshotDocument,
  embed = false,
  realEstateListings: RealEstateListingDocument[] = [],
  isTrial = false,
  userPoiIcons?: IApiUserPoiIcons,
): ApiSearchResultSnapshotResponse => {
  const centerOfLocation = searchResultSnapshot.snapshot.location;

  // we need this when the estate is located in the center of the map in order to provide
  // all necessary information in the exported files (PDF, DOCX)
  let realEstateListing: ApiRealEstateListing;

  // filter / hide real estate listings
  const mappedListings = realEstateListings.reduce<ApiRealEstateListing[]>(
    (result, currentEstate) => {
      if (!currentEstate.showInSnippet) {
        return result;
      }

      const mappedApiRealEstateListing =
        mapRealEstateListingToApiRealEstateListing(
          currentEstate,
          searchResultSnapshot.userId,
          !!searchResultSnapshot?.config?.showAddress,
        );

      const isNotEstateAtCenter =
        mappedApiRealEstateListing.coordinates.lat !== centerOfLocation.lat ||
        mappedApiRealEstateListing.coordinates.lng !== centerOfLocation.lng;

      if (isNotEstateAtCenter) {
        result.push(mappedApiRealEstateListing);
      } else {
        realEstateListing = mappedApiRealEstateListing;
      }

      return result;
    },
    [],
  );

  const { config, snapshot } = searchResultSnapshot;

  if (config && config.fixedRealEstates) {
    const { entityVisibility = [] } = config;

    config.entityVisibility = [
      ...entityVisibility,
      ...mappedListings
        .filter(
          (l) => !snapshot.realEstateListings.some((rel) => rel.id === l.id),
        )
        .map((l) => ({
          id: l.id,
          excluded: true,
        })),
    ];
  }

  return {
    isTrial,
    userPoiIcons,
    id: searchResultSnapshot.id,
    snapshot: mapSnapshot(
      {
        ...searchResultSnapshot.snapshot,
        realEstateListing,
        realEstateListings: mappedListings,
      },
      searchResultSnapshot.config,
      embed,
    ),
    description: embed ? undefined : searchResultSnapshot.description,
    lastAccess: searchResultSnapshot.lastAccess,
    visitAmount: searchResultSnapshot.visitAmount,
    config: searchResultSnapshot.config,
    token: searchResultSnapshot.token,
    mapboxAccessToken: searchResultSnapshot.mapboxAccessToken,
    createdAt: searchResultSnapshot.createdAt,
    endsAt: searchResultSnapshot.endsAt,
    iframeEndsAt: searchResultSnapshot.iframeEndsAt,
    updatedAt: searchResultSnapshot.updatedAt,
    integrationId: searchResultSnapshot.integrationParams?.integrationId,
  };
};

const mapSnapshot = (
  snapshot: ApiSearchResultSnapshotDto,
  config: ApiSearchResultSnapshotConfigDto,
  embed: boolean,
): ApiSearchResultSnapshotDto => {
  if (!embed || config.showAddress) {
    return snapshot;
  }

  const randomizedCoordinates: ApiCoordinatesDto = randomizeCoordinates(
    snapshot.location,
  );

  // no location
  const searchResponseWithoutLocation: ApiSearchResponseDto = {
    ...snapshot.searchResponse,
    centerOfInterest: {
      coordinates: randomizedCoordinates,
      address: null,
      distanceInMeters: 0,
      entity: null,
    },
  };

  return {
    ...snapshot,
    placesLocation: null,
    location: randomizedCoordinates,
    searchResponse: searchResponseWithoutLocation,
  };
};
