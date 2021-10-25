import {
  ApiIsochrone,
  ApiOsmEntityCategory,
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
import {IsochroneService} from 'src/client/isochrone/isochrone.service';
import {OverpassService} from 'src/client/overpass/overpass.service';
import {LocationSearch, LocationSearchDocument,} from './schema/location-search.schema';
import {calculateMinutesToMeters} from '../../../shared/constants/constants';
import { UserService } from 'src/user/user.service';
import { UserDocument } from 'src/user/schema/user.schema';

@Injectable()
export class LocationService {
  constructor(
    private overpassService: OverpassService,
    private isochroneService: IsochroneService,
    @InjectModel(LocationSearch.name)
    private locationModel: Model<LocationSearchDocument>,
    private userService: UserService
  ) {}

  async searchLocation(user: UserDocument, search: ApiSearch): Promise<ApiSearchResponse> {
    const coordinates = search.coordinates;
    const preferredAmenities = search.preferredAmenities;

    const routingProfiles = {};

    function deriveMeterEquivalent(routingProfile: TransportationParam) {
      const { amount } = routingProfile;
      if (routingProfile.unit === UnitsOfTransportation.METERS) {
        return amount;
      }
      switch (routingProfile.type) {
        case MeansOfTransportation.BICYCLE:
          return (
            amount *
            calculateMinutesToMeters.find(
              mtm => mtm.mean === MeansOfTransportation.BICYCLE,
            )?.multiplicator
          );
        case MeansOfTransportation.CAR:
          return (
            amount *
            calculateMinutesToMeters.find(
              mtm => mtm.mean === MeansOfTransportation.CAR,
            )?.multiplicator
          );
        case MeansOfTransportation.WALK:
          return (
            amount *
            calculateMinutesToMeters.find(
              mtm => mtm.mean === MeansOfTransportation.WALK,
            )?.multiplicator
          );
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
        isochrone,
      };
    }

    await new this.locationModel({ locationSearch: search }).save();
    await this.userService.incrementExecutedRequestCount(user.id);

    return {
      centerOfInterest: {
        entity: {
          label: 'Zentrum',
          name: OsmName.doctors,
          type: OsmType.amenity,
          category: ApiOsmEntityCategory.LEISURE
        },
        coordinates,
        distanceInMeters: 0,
        address: {
          street: 'Mein Standort'
        },
      },
      routingProfiles: routingProfiles as Record<
        MeansOfTransportation,
        { locationsOfInterest: ApiOsmLocation[]; isochrone: ApiIsochrone }
      >,
    };
  }
}
