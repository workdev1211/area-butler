import { ApiSearch, ApiSearchResponse } from '@area-butler-types/types';
import { Body, Controller, Post } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('api/location')
export class LocationController {

    constructor(private locationService: LocationService) {}

    @Post('search')
    async searchLocation(@Body() search: ApiSearch) : Promise<ApiSearchResponse> {
        return this.locationService.searchLocation(search);
    } 


}
