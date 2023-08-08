import { Injectable } from '@nestjs/common';

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
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import {
  defaultPoiTypes,
  defaultSnapshotConfig,
  defaultTransportParams,
} from '../../../shared/constants/location';

@Injectable()
export class SnapshotExtService {
  constructor(
    private readonly locationService: LocationService,
    private readonly routingService: RoutingService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {}

  async createSnapshot({
    user,
    location,
    transportParams,
    poiTypes,
  }: {
    user: UserDocument;
    location: string | ApiCoordinates;
    transportParams?: TransportationParam[];
    poiTypes?: OsmName[];
  }): Promise<ApiSearchResultSnapshotResponse> {
    const resultTransportParams = Array.isArray(transportParams)
      ? [...transportParams]
      : [...defaultTransportParams];

    const place = await this.googleGeocodeService.fetchPlace(location);

    const placesLocation: IApiPlacesLocation = {
      label: place.formatted_address || 'Mein Standort',
      value: { place_id: place?.place_id || '123' },
    };

    const coordinates: ApiCoordinates = { ...place.geometry.location };

    const searchData: ApiSearch = {
      coordinates,
      preferredAmenities: poiTypes || defaultPoiTypes,
      meansOfTransportation: resultTransportParams,
      searchTitle: place.formatted_address,
    };

    const searchResponse = await this.locationService.searchLocation(
      user,
      searchData,
    );

    const localityParams = searchData.preferredAmenities
      .map((name) => osmEntityTypes.find((entity) => entity.name === name))
      .filter(Boolean) as ApiOsmEntity[];

    const snapshot: ApiSearchResultSnapshot = {
      localityParams,
      placesLocation,
      searchResponse,
      location: searchData.coordinates,
      preferredLocations: [],
      realEstateListings: [],
      routes: [],
      transitRoutes: [],
      transportationParams: searchData.meansOfTransportation,
    };

    return this.locationService.createSnapshot(
      user,
      snapshot,
      defaultSnapshotConfig,
    );
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
    ).map((l) => mapRealEstateListingToApiRealEstateListing(l, user.id));

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

    return this.locationService.createSnapshot(user, snapshot, config);
  }

  async createSnapshotFromTemplate(
    user: UserDocument,
    location: ApiCoordinates | string,
    templateId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const {
      config,
      snapshot: { transportationParams, localityParams, preferredLocations },
    } = await this.locationService.fetchSnapshotById(user, templateId);

    const place = await this.googleGeocodeService.fetchPlace(location);

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
}
