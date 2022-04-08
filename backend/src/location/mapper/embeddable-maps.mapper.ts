import { SearchResultSnapshotDocument } from '../schema/search-result-snapshot.schema';
import { RealEstateListingDocument } from '../../real-estate-listing/schema/real-estate-listing.schema';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import { randomizeCoordinates } from '../../shared/shared.functions';
import ApiSearchResultSnapshotResponseDto from '../../dto/api-search-result-snapshot-response.dto';
import ApiSearchResultSnapshotDto from '../../dto/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotConfigDto from '../../dto/api-search-result-snapshot-config.dto';
import ApiCoordinatesDto from '../../dto/api-coordinates.dto';
import ApiSearchResponseDto from '../../dto/api-search-response.dto';

export const mapSearchResultSnapshotToApiEmbeddableMap = (
  searchResultSnapshot: SearchResultSnapshotDocument,
  embed = false,
  realEstateListings: RealEstateListingDocument[] = [],
): ApiSearchResultSnapshotResponseDto => {
  const centerOfLocation = searchResultSnapshot.snapshot.location;
  // filter / hide real estate listings
  const mappedListings = realEstateListings
    .map((r) =>
      mapRealEstateListingToApiRealEstateListing(
        r,
        !!searchResultSnapshot?.config?.showLocation,
      ),
    )
    .filter((r) => r.showInSnippet)
    .filter(
      (r) =>
        !(
          r.coordinates.lat === centerOfLocation.lat &&
          r.coordinates.lng === centerOfLocation.lng
        ),
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
