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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import ApiRealEstateListingDto from '../dto/api-real-estate-listing.dto';
import ApiUpsertRealEstateListingDto from '../dto/api-upsert-real-estate-listing.dto';

@ApiTags('real-estate-listings')
@Controller('api/real-estate-listings')
export class RealEstateListingController extends AuthenticatedController {
  constructor(private realEstateListingService: RealEstateListingService) {
    super();
  }

  @ApiOperation({ description: 'Get real estate listings for current user' })
  @Get()
  public async fetchRealEstateListings(
    @InjectUser() user: UserDocument,
  ): Promise<ApiRealEstateListingDto[]> {
    return (
      await this.realEstateListingService.getRealEstateListings(user)
    ).map((l) => mapRealEstateListingToApiRealEstateListing(l));
  }

  @ApiOperation({ description: 'Insert a new real estate listing' })
  @Post()
  public async insertRealEstateListing(
    @InjectUser() user: UserDocument,
    @Body() realEstateListing: ApiUpsertRealEstateListingDto,
  ): Promise<ApiRealEstateListingDto> {
    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingService.insertRealEstateListing(
        user,
        realEstateListing,
      ),
    );
  }

  @ApiOperation({ description: 'Update a real estate listing' })
  @Put(':id')
  public async updateRealEstateListing(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
    @Body() realEstateListing: Partial<ApiUpsertRealEstateListingDto>,
  ): Promise<ApiRealEstateListingDto> {
    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingService.updateRealEstateListing(
        user,
        id,
        realEstateListing,
      ),
    );
  }

  @ApiOperation({ description: 'Delete a real estate listing' })
  @Delete(':id')
  public async deleteRealEstateListing(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
  ) {
    await this.realEstateListingService.deleteRealEstateListing(user, id);
  }
}
