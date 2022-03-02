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

export const mapSearchResultSnapshotToApiEmbeddableMap = (
  searchResultSnapshot: SearchResultSnapshotDocument,
  embed = false,
  realEstateListings: RealEstateListingDocument[] = [],
): ApiSearchResultSnapshotResponse => {
  // filter / hide real estate listings
  const mappedListings = realEstateListings.map(r =>
    mapRealEstateListingToApiRealEstateListing(r),
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

const randomizeCoordinates = ({ lat, lng }: ApiCoordinates): ApiCoordinates => {
  const d1 = randomInt() / 10000;
  const d2 = randomInt() / 10000;
  return {
    lat: lat + d1,
    lng: lng + d2,
  };
};

const randomInt = (min = -10, max = 10) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
