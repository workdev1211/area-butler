import {Controller, Get, NotFoundException, Query} from '@nestjs/common';
import {RoutingService} from "./routing.service";
import {ApiPotentialCustomer} from "@area-butler-types/potential-customer";
import {mapPotentialCustomerToApiPotentialCustomer} from "../potential-customer/mapper/potential-customer.mapper";
import {ApiRoutingTransportType} from "@area-butler-types/routing";

interface ApiRouteQuery {
    originLat: number;
    originLng: number;
    destinationLat: number;
    destinationLng: number;
    transportMode: ApiRoutingTransportType
}

@Controller('api/routing')
export class RoutingController {
    constructor(private routingService: RoutingService) {}

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


}
