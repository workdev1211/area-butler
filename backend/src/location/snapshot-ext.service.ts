import { Injectable } from '@nestjs/common';
import { GeocodeResult } from '@googlemaps/google-maps-services-js';

import { osmEntityTypes } from '../../../shared/constants/constants';
import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiSearch,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotResponse,
  IApiPlacesLocation,
  OsmName,
  TransportationParam,
} from '@area-butler-types/types';
import { UserDocument } from '../user/schema/user.schema';
import { LocationService } from './location.service';
import { RoutingService } from '../routing/routing.service';
import {
  defaultPoiTypes,
  defaultTransportParams,
} from '../../../shared/constants/location';
import { SnapshotService } from './snapshot.service';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { PlaceService } from '../place/place.service';
import { FetchSnapshotService } from './fetch-snapshot.service';

interface ICreateSnapshot {
  user: UserDocument | TIntegrationUserDocument;
  location: string | ApiCoordinates;
  templateSnapshotId?: string;
  externalId?: string;
  realEstateListing?: ApiRealEstateListing;
  transportParams?: TransportationParam[];
  poiTypes?: OsmName[];
  primaryColor?: string;
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
    private readonly placeService: PlaceService,
    private readonly fetchSnapshotService: FetchSnapshotService,
  ) {}

  async createSnapshotByPlace({
    user,
    place,
    templateSnapshotId,
    externalId,
    primaryColor,
    realEstateListing,
    transportParams = [...defaultTransportParams],
    poiTypes = [...defaultPoiTypes],
  }: ICreateSnapshotByPlace): Promise<ApiSearchResultSnapshotResponse> {
    const searchData: ApiSearch = {
      coordinates: { ...place.geometry.location },
      integrationId:
        'integrationUserId' in user
          ? realEstateListing.integrationId
          : undefined,
      meansOfTransportation: transportParams,
      preferredAmenities: poiTypes,
      searchTitle: place.formatted_address,
    };

    const searchResponse = await this.locationService.searchLocation(
      user,
      searchData,
      realEstateListing,
    );

    // TODO refactor to 'reduce'
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
      searchResponse,
      location: searchData.coordinates,
      transportationParams: searchData.meansOfTransportation,
    };

    let snapshotConfig;

    if (templateSnapshotId) {
      const { config } =
        await this.fetchSnapshotService.fetchSnapshotByIdOrFail(
          user,
          templateSnapshotId,
        );

      snapshotConfig = config;
    }

    return this.snapshotService.createSnapshot(
      user,
      {
        snapshotReq: { integrationId: realEstateListing?.integrationId, snapshot },
        config: snapshotConfig,
        externalId,
        primaryColor
      }
    );
  }

  async createSnapshot({
    user,
    location,
    realEstateListing,
    templateSnapshotId,
    transportParams,
    poiTypes,
    primaryColor,
    externalId
  }: ICreateSnapshot): Promise<ApiSearchResultSnapshotResponse> {
    const place = await this.placeService.fetchPlaceOrFail({ user, location });

    return this.createSnapshotByPlace({
      user,
      place,
      templateSnapshotId,
      realEstateListing,
      transportParams,
      poiTypes,
      externalId,
      primaryColor
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
    } = await this.fetchSnapshotService.fetchSnapshotByIdOrFail(
      user,
      templateSnapshotId,
    );

    const place = await this.placeService.fetchPlaceOrFail({ user, location });

    const placesLocation = {
      label: place?.formatted_address || 'Mein Standort',
      value: { place_id: place?.place_id || '123' },
    };

    const preferredAmenities = localityParams.map(({ name }) => name);

    const searchData: ApiSearch = {
      preferredAmenities,
      preferredLocations,
      coordinates: place?.geometry?.location,
      meansOfTransportation: transportationParams,
      searchTitle: placesLocation.label,
    };

    const searchResponse = await this.locationService.searchLocation(
      user,
      searchData,
    );

    const resultLocParams = searchData.preferredAmenities.reduce<
      ApiOsmEntity[]
    >((result, name) => {
      const foundEntity = osmEntityTypes.find((entity) => entity.name === name);

      if (foundEntity) {
        result.push(foundEntity);
      }

      return result;
    }, []);

    const snapshot: ApiSearchResultSnapshot = {
      placesLocation,
      searchResponse,
      location: searchData.coordinates,
      localityParams: resultLocParams,
      transportationParams: searchData.meansOfTransportation,
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

    return this.snapshotService.createSnapshot(
      user,
      {
        snapshotReq: { snapshot },
        config,
        isCheckAllowedCountries: false
      },
    );
  }
}
