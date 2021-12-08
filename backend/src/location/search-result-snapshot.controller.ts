import { ApiSearchResultSnapshotResponse } from "@area-butler-types/types";
import { Controller, Get, Param } from "@nestjs/common";
import { LocationService } from "./location.service";



@Controller('api/locaiton/snapshot')
export class LocationController {


    constructor(private locationService: LocationService) {}

    @Get(':token')
    async fetchSnapshot(@Param('token') token: string) : Promise<ApiSearchResultSnapshotResponse> {
        return this.locationService.fetchSearchResultSnapshot(token);
    }

}