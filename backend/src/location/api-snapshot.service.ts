import { Injectable } from '@nestjs/common';

import { osmEntityTypes } from '../../../shared/constants/constants';
import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiSearch,
  ApiSearchResultSnapshotResponse,
  IApiCreateRouteSnapshotQuery,
} from '@area-butler-types/types';
import { UserDocument } from '../user/schema/user.schema';
import { LocationService } from './location.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { RoutingService } from '../routing/routing.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';

@Injectable()
export class ApiSnapshotService {
  constructor(
    private readonly locationService: LocationService,
    private readonly routingService: RoutingService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {}

  async createRouteSnapshot(
    user: UserDocument,
    {
      searchData,
      searchResponse,
      placesLocation,
      config,
    }: IApiCreateRouteSnapshotQuery,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const { routes, transitRoutes } =
      await this.routingService.fetchPreferredLocationRoutes({
        origin: searchData.coordinates,
        preferredLocations: searchData.preferredLocations,
      });

    const realEstateListings = (
      await this.realEstateListingService.getRealEstateListings(user)
    ).map((l) => mapRealEstateListingToApiRealEstateListing(l, user.id));

    const localityParams = searchData.preferredAmenities
      .map((name) => osmEntityTypes.find((entity) => entity.name === name))
      .filter(Boolean) as ApiOsmEntity[];

    const realEstateListing = realEstateListings.find(
      (l) =>
        JSON.stringify(l.coordinates) ===
        JSON.stringify(searchData.coordinates),
    );

    return this.locationService.createSnapshot(
      user,
      {
        placesLocation,
        location: searchData.coordinates,
        transportationParams: searchData.meansOfTransportation,
        localityParams,
        searchResponse,
        realEstateListings,
        preferredLocations: searchData.preferredLocations,
        routes,
        transitRoutes,
        realEstateListing,
      },
      config,
    );
  }

  async createSnapshotFromTemplate(
    user: UserDocument,
    location: ApiCoordinates | string,
    templateId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const {
      config,
      snapshot: { transportationParams, localityParams, preferredLocations },
    } = await this.locationService.fetchSnapshot(user, templateId);

    const place =
      typeof location === 'string'
        ? await this.googleGeocodeService.fetchPlaceByAddress(location)
        : await this.googleGeocodeService.fetchPlaceByCoordinates(location);
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
