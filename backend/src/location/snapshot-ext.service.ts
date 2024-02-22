import { Injectable } from '@nestjs/common';
import { GeocodeResult } from '@googlemaps/google-maps-services-js';

import { osmEntityTypes } from '../../../shared/constants/constants';
import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiSearch,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotResponse,
  IApiCreateRouteSnapshot,
  IApiPlacesLocation,
  OsmName,
  TransportationParam,
} from '@area-butler-types/types';
import { UserDocument } from '../user/schema/user.schema';
import { LocationService } from './location.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { RoutingService } from '../routing/routing.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { GoogleApiService } from '../client/google/google-api.service';
import {
  defaultPoiTypes,
  defaultTransportParams,
} from '../../../shared/constants/location';
import { SnapshotService } from './snapshot.service';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

interface ICreateSnapshot {
  user: UserDocument | TIntegrationUserDocument;
  location: string | ApiCoordinates;
  templateSnapshotId?: string;
  realEstateListing?: ApiRealEstateListing;
  transportParams?: TransportationParam[];
  poiTypes?: OsmName[];
}

interface ICreateSnapshotByPlace extends Omit<ICreateSnapshot, 'location'> {
  place: GeocodeResult;
}

@Injectable()
export class SnapshotExtService {
  constructor(
    private readonly locationService: LocationService,
    private readonly snapshotService: SnapshotService,
    private readonly routingService: RoutingService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly googleApiService: GoogleApiService,
  ) {}

  async createSnapshotByPlace({
    user,
    place,
    templateSnapshotId,
    realEstateListing,
    transportParams = [...defaultTransportParams],
    poiTypes = [...defaultPoiTypes],
  }: ICreateSnapshotByPlace): Promise<ApiSearchResultSnapshotResponse> {
    const searchData: ApiSearch = {
      coordinates: { ...place.geometry.location },
      meansOfTransportation: transportParams,
      preferredAmenities: poiTypes,
      searchTitle: place.formatted_address,
    };

    const searchResponse = await this.locationService.searchLocation(
      user,
      searchData,
    );

    const localityParams = searchData.preferredAmenities
      .map((name) => osmEntityTypes.find((entity) => entity.name === name))
      .filter(Boolean) as ApiOsmEntity[];

    const placesLocation: IApiPlacesLocation = {
      label: place.formatted_address || 'Mein Standort',
      value: { place_id: place?.place_id || '123' },
    };

    const snapshot: ApiSearchResultSnapshot = {
      localityParams,
      placesLocation,
      realEstateListing,
      searchResponse,
      location: searchData.coordinates,
      preferredLocations: [],
      realEstateListings: [],
      routes: [],
      transitRoutes: [],
      transportationParams: searchData.meansOfTransportation,
      integrationId: realEstateListing?.integrationId,
    };

    let snapshotConfig;

    if (templateSnapshotId) {
      const { config } = await this.locationService.fetchSnapshotByIdOrFail(
        user,
        templateSnapshotId,
      );

      snapshotConfig = config;
    }

    return this.snapshotService.createSnapshot(user, snapshot, snapshotConfig);
  }

  async createSnapshot({
    user,
    location,
    realEstateListing,
    templateSnapshotId,
    transportParams,
    poiTypes,
  }: ICreateSnapshot): Promise<ApiSearchResultSnapshotResponse> {
    const place = await this.googleApiService.fetchPlaceOrFail(location);

    return this.createSnapshotByPlace({
      user,
      place,
      templateSnapshotId,
      realEstateListing,
      transportParams,
      poiTypes,
    });
  }

  async createSnapshotFromTemplate(
    user: UserDocument,
    location: ApiCoordinates | string,
    templateSnapshotId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const {
      config,
      snapshot: { transportationParams, localityParams, preferredLocations },
    } = await this.locationService.fetchSnapshotByIdOrFail(
      user,
      templateSnapshotId,
    );

    const place = await this.googleApiService.fetchPlaceOrFail(location);

    const placesLocation = {
      label: place?.formatted_address || 'Mein Standort',
      value: { place_id: place?.place_id || '123' },
    };

    const preferredAmenities = localityParams.map(({ name }) => name);

    const searchData: ApiSearch = {
      searchTitle: placesLocation.label,
      coordinates: place?.geometry?.location,
      meansOfTransportation: transportationParams,
      preferredAmenities,
      preferredLocations,
    };

    const searchResponse = await this.locationService.searchLocation(
      user,
      searchData,
    );

    return this.createRouteSnapshot(user, {
      searchData,
      searchResponse,
      placesLocation,
      config,
    });
  }

  async createRouteSnapshot(
    user: UserDocument,
    {
      searchData,
      searchResponse,
      placesLocation,
      config,
    }: IApiCreateRouteSnapshot,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const realEstateListings = (
      await this.realEstateListingService.fetchRealEstateListings(user)
    ).map((realEstate) =>
      mapRealEstateListingToApiRealEstateListing(user, realEstate),
    );

    const localityParams = searchData.preferredAmenities
      .map((name) => osmEntityTypes.find((entity) => entity.name === name))
      .filter(Boolean) as ApiOsmEntity[];

    const realEstateListing = realEstateListings.find(
      (l) =>
        JSON.stringify(l.coordinates) ===
        JSON.stringify(searchData.coordinates),
    );

    const snapshot: ApiSearchResultSnapshot = {
      placesLocation,
      location: searchData.coordinates,
      transportationParams: searchData.meansOfTransportation,
      localityParams,
      searchResponse,
      realEstateListings,
      realEstateListing,
      preferredLocations: [],
      routes: [],
      transitRoutes: [],
    };

    if (searchData.preferredLocations) {
      const { routes, transitRoutes } =
        await this.routingService.fetchPreferredLocationRoutes({
          userEmail: user.email,
          origin: searchData.coordinates,
          preferredLocations: searchData.preferredLocations,
        });

      Object.assign(snapshot, {
        preferredLocations: searchData.preferredLocations,
        routes,
        transitRoutes,
      });
    }

    return this.snapshotService.createSnapshot(user, snapshot, config);
  }
}
