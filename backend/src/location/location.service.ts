import {
  ApiSearch,
  ApiSearchResponse,
  OsmName,
  OsmType,
} from '@area-butler-types/types';
import { Injectable } from '@nestjs/common';
import { GeocodingService } from 'src/client/geocoding/geocoding.service';
import { IsochroneService } from 'src/client/isochrone/isochrone.service';
import { OverpassService } from 'src/client/overpass/overpass.service';

@Injectable()
export class LocationService {
  constructor(
    private geocodingService: GeocodingService,
    private overpassService: OverpassService,
    private isochroneService: IsochroneService,
  ) {}

  async searchLocation(search: ApiSearch): Promise<ApiSearchResponse> {
    const coordinates = !!search.coordinates
      ? search.coordinates
      : await this.geocodingService.geocode(search.address);
    const address = search.address
      ? search.address
      : await this.geocodingService.reverse(search.coordinates);
    const routingProfile = search.meansOfTransportation[0];
    const preferredAmenities = search.preferredAmenities;

    const locationsOfInterest = await this.overpassService.fetchEntites(
      coordinates,
      routingProfile.amount,
      preferredAmenities,
    );
    
    const isochrone = await this.isochroneService.fetchIsochrone(
      routingProfile.type,
      coordinates,
      routingProfile.amount,
      routingProfile.unit,
    );

    return {
      centerOfInterest: {
        entity: {
          label: 'Zentrum',
          name: OsmName.doctors,
          type: OsmType.amenity,
        },
        coordinates,
        distanceInMeters: 0,
        address
      },
      locationsOfInterest,
      isochrone
    };
  }
}
