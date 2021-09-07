import {
  ApiRealEstateListing,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { mapRealEstateListingToApiRealEstateListing } from './mapper/real-estate-listing.mapper';
import { RealEstateListingService } from './real-estate-listing.service';

@Controller('api/real-estate-listings')
export class RealEstateListingController extends AuthenticatedController {
  constructor(private realEstateListingService: RealEstateListingService) {
    super();
  }

  @Get()
  public async fetchRealEstateListings(
    @InjectUser() user: UserDocument,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.getRealEstateListings(user)
    ).map(l => mapRealEstateListingToApiRealEstateListing(l));
  }

  @Post()
  public async insertRealEstateListing(
    @InjectUser() user: UserDocument,
    @Body() realEstateListing: ApiUpsertRealEstateListing,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingService.insertRealEstateListing(
        user,
        realEstateListing,
      ),
    );
  }

  @Put(':id')
  public async updateRealEstateListing(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
    @Body() realEstateListing: Partial<ApiUpsertRealEstateListing>,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingService.updateRealEstateListing(
        user,
        id,
        realEstateListing,
      ),
    );
  }

  @Delete(':id')
  public async deleteRealEstateListing(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
  ) {
    await this.realEstateListingService.deleteRealEstateListing(user, id);
  }
}
