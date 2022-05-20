import { SearchResultSnapshotDocument } from '../schema/search-result-snapshot.schema';
import { RealEstateListingDocument } from '../../real-estate-listing/schema/real-estate-listing.schema';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import { randomizeCoordinates } from '../../shared/shared.functions';
import ApiSearchResultSnapshotResponseDto from '../../dto/api-search-result-snapshot-response.dto';
import ApiSearchResultSnapshotDto from '../../dto/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotConfigDto from '../../dto/api-search-result-snapshot-config.dto';
import ApiCoordinatesDto from '../../dto/api-coordinates.dto';
import ApiSearchResponseDto from '../../dto/api-search-response.dto';
import ApiRealEstateListingDto from '../../dto/api-real-estate-listing.dto';

export const mapSearchResultSnapshotToApiEmbeddableMap = (
  searchResultSnapshot: SearchResultSnapshotDocument,
  embed = false,
  realEstateListings: RealEstateListingDocument[] = [],
): ApiSearchResultSnapshotResponseDto => {
  const centerOfLocation = searchResultSnapshot.snapshot.location;

  // we need this when the estate is located in the center of the map in order to provide
  // all necessary information in the exported files (PDF, DOCX)
  let realEstateListing: ApiRealEstateListingDto;

  // filter / hide real estate listings
  const mappedListings = realEstateListings.reduce<ApiRealEstateListingDto[]>(
    (accum, curVal) => {
      if (!curVal.showInSnippet) {
        return accum;
      }

      const mappedApiRealEstateListing =
        mapRealEstateListingToApiRealEstateListing(
          curVal,
          !!searchResultSnapshot?.config?.showLocation,
        );

      const isNotEstateAtCenter =
        mappedApiRealEstateListing.coordinates.lat !== centerOfLocation.lat ||
        mappedApiRealEstateListing.coordinates.lng !== centerOfLocation.lng;

      if (isNotEstateAtCenter) {
        accum.push(mappedApiRealEstateListing);
      } else {
        realEstateListing = mappedApiRealEstateListing;
      }

      return accum;
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
    id: searchResultSnapshot.id,
    snapshot: mapSearchResultSnapshot(
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
    config: searchResultSnapshot.config,
    token: searchResultSnapshot.token,
    mapboxToken: searchResultSnapshot.mapboxAccessToken,
    createdAt: searchResultSnapshot.createdAt,
  };
};

const mapSearchResultSnapshot = (
  snapshot: ApiSearchResultSnapshotDto,
  config: ApiSearchResultSnapshotConfigDto,
  embed: boolean,
): ApiSearchResultSnapshotDto => {
  if (!embed || !config || config.showAddress !== false) {
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
