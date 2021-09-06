import { ApiSearch, ApiSearchResponse } from '@area-butler-types/types';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { LocationService } from './location.service';

@Controller('api/location')
export class LocationController extends AuthenticatedController {

    constructor(private locationService: LocationService) {
        super();
    }

    @Post('search')
    async searchLocation(@InjectUser() user: UserDocument,  @Body() search: ApiSearch) : Promise<ApiSearchResponse> {
        return this.locationService.searchLocation(search);
    } 

}
