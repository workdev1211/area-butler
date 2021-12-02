import {
    ApiIsochrone,
    ApiOsmEntityCategory,
    ApiOsmLocation,
    ApiSearch,
    ApiSearchResponse,
    ApiUserRequests,
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
import {groupBy} from '../../../shared/functions/shared.functions';
import {UserService} from 'src/user/user.service';
import {retrieveTotalRequestContingent, UserDocument} from 'src/user/schema/user.schema';
import {SubscriptionService} from "../user/subscription.service";
import {OverpassDataService} from "../data-provision/overpass-data/overpass-data.service";
import {configService} from "../config/config.service";

@Injectable()
export class LocationService {
    constructor(
        private overpassService: OverpassService,
        private isochroneService: IsochroneService,
        @InjectModel(LocationSearch.name)
        private locationModel: Model<LocationSearchDocument>,
        private userService: UserService,
        private subscriptionService: SubscriptionService,
        private overpassDataService: OverpassDataService
    ) {
    }

    async searchLocation(user: UserDocument, search: ApiSearch): Promise<ApiSearchResponse> {

        await this.subscriptionService.checkSubscriptionViolation(
            user._id,
            _ => user.requestsExecuted + 1 > retrieveTotalRequestContingent(user).map(c => c.amount).reduce((acc, inc) => acc + inc),
            'Im aktuellen Monat sind keine weiteren Abfragen möglich',
        );

        const coordinates = search.coordinates;
        const preferredAmenities = search.preferredAmenities;

        const routingProfiles = {};

        function deriveMeterEquivalent(routingProfile: TransportationParam) {
            const {amount} = routingProfile;
            if (routingProfile.unit === UnitsOfTransportation.KILOMETERS) {
                // convert km to m
                return amount * 1000;
            }
            switch (routingProfile.type) {
                case MeansOfTransportation.BICYCLE:
                    return (
                        (amount * 1.2) *
                        calculateMinutesToMeters.find(
                            mtm => mtm.mean === MeansOfTransportation.BICYCLE,
                        )?.multiplicator
                    );
                case MeansOfTransportation.CAR:
                    return (
                        (amount * 1.2) *
                        calculateMinutesToMeters.find(
                            mtm => mtm.mean === MeansOfTransportation.CAR,
                        )?.multiplicator
                    );
                case MeansOfTransportation.WALK:
                    return (
                        (amount * 1.2) *
                        calculateMinutesToMeters.find(
                            mtm => mtm.mean === MeansOfTransportation.WALK,
                        )?.multiplicator
                    );
                default:
                    return 0;
            }
        }

        for (const routingProfile of search.meansOfTransportation) {
            const locationsOfInterest = !!configService.useOverpassDb() ? await this.overpassDataService.findForCenterAndDistance(
                coordinates,
                deriveMeterEquivalent(routingProfile),
                preferredAmenities) : await this.overpassService.fetchEntites(
                coordinates,
                deriveMeterEquivalent(routingProfile),
                preferredAmenities,
            );

            const isochrone = await this.isochroneService.fetchIsochrone(
                routingProfile.type,
                coordinates,
                routingProfile.unit === UnitsOfTransportation.KILOMETERS ? routingProfile.amount * 1000 : routingProfile.amount, // convert KM to M
                routingProfile.unit,
            );

            routingProfiles[routingProfile.type] = {
                locationsOfInterest,
                isochrone,
            };
        }

        await new this.locationModel({userId: user._id, locationSearch: search}).save();
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
            routingProfiles: routingProfiles as Record<MeansOfTransportation,
                { locationsOfInterest: ApiOsmLocation[]; isochrone: ApiIsochrone }>,
        };
    }

    async latestUserRequests(user: UserDocument): Promise<ApiUserRequests> {
        const requests = (await this.locationModel.find({userId: user._id}).sort({createdAt: -1})).map(d => d.locationSearch);

        const grouped = groupBy(
            requests,
            (request: ApiSearch) => `${request.coordinates.lat}${request.coordinates.lng}`
          );


        return {
            requests: Object.values(grouped).map(g => g[0])
        };
    }
}
