import {
  ApiIsochrone,
  ApiOsmLocation,
  ApiSearch,
  ApiSearchResponse,
  MeansOfTransportation,
  OsmName,
  OsmType,
  TransportationParam,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {GeocodingService} from 'src/client/geocoding/geocoding.service';
import {IsochroneService} from 'src/client/isochrone/isochrone.service';
import {OverpassService} from 'src/client/overpass/overpass.service';
import {LocationSearch, LocationSearchDocument} from './schema/location-search.schema';

@Injectable()
export class LocationService {
  constructor(
    private geocodingService: GeocodingService,
    private overpassService: OverpassService,
    private isochroneService: IsochroneService,
    @InjectModel(LocationSearch.name) private locationModel: Model<LocationSearchDocument>
  ) {}

  async searchLocation(search: ApiSearch): Promise<ApiSearchResponse> {
    const coordinates = !!search?.coordinates
      ? search.coordinates
      : (await this.geocodingService.geocode(search.address));
    const address = !!search?.address
      ? search.address
      : (await this.geocodingService.reverse(search.coordinates));
    const preferredAmenities = search.preferredAmenities;

  
    const routingProfiles = {};

    function deriveMeterEquivalent(routingProfile: TransportationParam) {
      const {amount} = routingProfile;
      if (routingProfile.unit === UnitsOfTransportation.METERS) {
        return amount
      }
      switch (routingProfile.type) {
        case MeansOfTransportation.BICYCLE:
          return amount * 233;
        case MeansOfTransportation.CAR:
          return amount * 338;
        case MeansOfTransportation.WALK:
          return amount * 83;
        default:
          return 0;
      }
    }

    for (const routingProfile of search.meansOfTransportation) {
      const locationsOfInterest = await this.overpassService.fetchEntites(
        coordinates,
        deriveMeterEquivalent(routingProfile),
        preferredAmenities,
      );

      const isochrone = await this.isochroneService.fetchIsochrone(
        routingProfile.type,
        coordinates,
        routingProfile.amount,
        routingProfile.unit,
      );

      routingProfiles[routingProfile.type] = {
        locationsOfInterest,
        isochrone
      }
    }

    

    await new this.locationModel({locationSearch: search}).save();

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
      routingProfiles: routingProfiles as Record<MeansOfTransportation, {locationsOfInterest: ApiOsmLocation[]; isochrone: ApiIsochrone}>
    };
  }
}
