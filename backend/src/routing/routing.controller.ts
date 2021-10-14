import {Controller, Get, NotFoundException, Param, Query} from '@nestjs/common';
import {RoutingService} from "./routing.service";
import {ApiRoutingTransportType} from "@area-butler-types/routing";
import {PotentialCustomerService} from "../potential-customer/potential-customer.service";

interface ApiRouteQuery {
    originLat: number;
    originLng: number;
    destinationLat: number;
    destinationLng: number;
    transportMode: ApiRoutingTransportType
}

@Controller('api/routing')
export class RoutingController {
    constructor(
        private routingService: RoutingService,
        private potentialCustomerService: PotentialCustomerService
    ) {}

    @Get()
    async getRoute(
        @Query() query: ApiRouteQuery
    ) {
        const result = await this.routingService.getRoute(
            {lng: query.originLng, lat: query.originLat},
            {lng: query.destinationLng, lat: query.destinationLat},
            query.transportMode
        );
        if (result) {
            return result;
        } else {
            throw new NotFoundException("Could not find route")
        }
    }

    @Get('potential-customer/:potentialCustomerId/preferred')
    async preferredRoutes(
        @Param('potentialCustomerId') potentialCustomerId: string,
        @Query('originLat') originLat: number,
        @Query('originLng') originLng: number,
    ) {
        const potentialCustomer = await this.potentialCustomerService.findById(potentialCustomerId);

        if (potentialCustomer && potentialCustomer.preferredLocations?.length) {
            return potentialCustomer.preferredLocations.map((preferredLocation) => {
                return {
                    title: preferredLocation.title,
                    routes: ['car', 'bicycle', 'pedestrian'].map((transportType) => {
                        return this.routingService.getRoute({
                                lng: originLng,
                                lat: originLat
                            },
                            preferredLocation.coordinates,
                            transportType as ApiRoutingTransportType
                        )
                    })
                }
            } )
        } else {
            throw new NotFoundException("No preferred locations or potential customer not known")
        }
    }


}
