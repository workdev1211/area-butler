import {
  ApiCoordinates,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
} from '@area-butler-types/types';
import { SearchResultSnapshotDocument } from '../schema/search-result-snapshot.schema';
import { RealEstateListingDocument } from '../../real-estate-listing/schema/real-estate-listing.schema';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import { randomizeCoordinates } from '../../shared/shared.functions';

export const mapSearchResultSnapshotToApiEmbeddableMap = (
  searchResultSnapshot: SearchResultSnapshotDocument,
  embed = false,
  realEstateListings: RealEstateListingDocument[] = [],
): ApiSearchResultSnapshotResponse => {
  // filter / hide real estate listings
  const mappedListings = realEstateListings.map(r =>
    mapRealEstateListingToApiRealEstateListing(
      r,
      searchResultSnapshot.config.showLocation,
    ),
  );
  const { config, snapshot } = searchResultSnapshot;
  if (config && config.fixedRealEstates) {
    const { entityVisibility = [] } = config;
    config.entityVisibility = [
      ...entityVisibility,
      ...mappedListings
        .filter(l => !snapshot.realEstateListings.some(rel => rel.id === l.id))
        .map(l => ({
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
  snapshot: ApiSearchResultSnapshot,
  config: ApiSearchResultSnapshotConfig,
  embed: boolean,
): ApiSearchResultSnapshot => {
  if (!embed || !config || config.showLocation !== false) {
    return snapshot;
  }

  const randomizedCoordinates: ApiCoordinates = randomizeCoordinates(
    snapshot.location,
  );

  // no location
  const searchResponseWithoutLocation: ApiSearchResponse = {
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
