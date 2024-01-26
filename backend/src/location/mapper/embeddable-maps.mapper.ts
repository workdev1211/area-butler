import { SearchResultSnapshotDocument } from '../schema/search-result-snapshot.schema';
import { RealEstateListingDocument } from '../../real-estate-listing/schema/real-estate-listing.schema';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import {
  ApiCoordinates,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  IApiUserPoiIcons,
} from '@area-butler-types/types';
import { randomizeCoordinates } from '../../../../shared/functions/shared.functions';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { UserDocument } from '../../user/schema/user.schema';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';

export const mapSnapshotToEmbeddableMap = (
  user: UserDocument | TIntegrationUserDocument,
  searchResultSnapshot: SearchResultSnapshotDocument,
  isEmbedded = false,
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
          user,
          currentEstate,
          !!searchResultSnapshot?.config?.showAddress,
        );

      const isNotEstateAtCenter =
        currentEstate.location.coordinates[0] !== centerOfLocation.lat ||
        currentEstate.location.coordinates[1] !== centerOfLocation.lng;

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

  const processedSnapshot = mapSnapshot(
    {
      ...snapshot,
      realEstateListing,
      realEstateListings: mappedListings,
    },
    config,
    isEmbedded,
  );

  processedSnapshot.integrationId =
    searchResultSnapshot.integrationParams?.integrationId;

  return {
    isTrial,
    userPoiIcons,
    id: searchResultSnapshot.id,
    snapshot: processedSnapshot,
    description: isEmbedded ? undefined : searchResultSnapshot.description,
    lastAccess: searchResultSnapshot.lastAccess,
    visitAmount: searchResultSnapshot.visitAmount,
    config: searchResultSnapshot.config,
    token: searchResultSnapshot.token,
    mapboxAccessToken: searchResultSnapshot.mapboxAccessToken,
    createdAt: searchResultSnapshot.createdAt,
    endsAt: searchResultSnapshot.endsAt,
    iframeEndsAt: searchResultSnapshot.iframeEndsAt,
    updatedAt: searchResultSnapshot.updatedAt,
  };
};

const mapSnapshot = (
  snapshot: ApiSearchResultSnapshot,
  config: ApiSearchResultSnapshotConfig,
  isEmbedded: boolean,
): ApiSearchResultSnapshot => {
  if (!isEmbedded || config.showAddress) {
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
