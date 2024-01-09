import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { join as joinPath } from 'path';

import { mapRealEstateListingToApiRealEstateListing } from './mapper/real-estate-listing.mapper';
import { RealEstateListingService } from './real-estate-listing.service';
import ApiUpsertRealEstateListingDto from '../dto/api-upsert-real-estate-listing.dto';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import FileUploadDto from '../dto/file-upload.dto';
import {
  ApiExampleFileTypeEnum,
  ApiRealEstateExtSourcesEnum,
  ApiRealEstateListing,
  IApiRealEstStatusByUser,
} from '@area-butler-types/real-estate';
import { CsvFileFormatsEnum } from '@area-butler-types/types';
import ApiOpenAiRealEstDescQueryDto from './dto/api-open-ai-real-est-desc-query.dto';
import { RealEstateListingImportService } from './real-estate-listing-import.service';
import ApiUserApiConnectionSettingsDto from '../dto/api-user-api-connect-settings.dto';
import { RealEstateCrmImportService } from './real-estate-crm-import.service';
import { Role, Roles } from '../auth/roles.decorator';

@ApiTags('real-estate-listing')
@Controller('api/real-estate-listing')
export class RealEstateListingController extends AuthenticatedController {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly realEstateListingImportService: RealEstateListingImportService,
    private readonly realEstateCrmImportService: RealEstateCrmImportService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Insert a new real estate listing' })
  @Post()
  async createRealEstateListing(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() realEstateListing: ApiUpsertRealEstateListingDto,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      user,
      await this.realEstateListingService.createRealEstateListing(
        user,
        realEstateListing,
      ),
    );
  }

  @ApiOperation({ description: 'Get real estate listings for current user' })
  @Get('listings')
  async fetchRealEstateListings(
    @Query('status') status: string,
    @InjectUser() user: UserDocument,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.fetchRealEstateListings(user, status)
    ).map((realEstate) =>
      mapRealEstateListingToApiRealEstateListing(user, realEstate),
    );
  }

  @ApiOperation({ description: 'Get real estate statuses of the current user' })
  @Get('status')
  async fetchStatusesByUser(
    @InjectUser() user: UserDocument,
  ): Promise<IApiRealEstStatusByUser> {
    return this.realEstateListingService.fetchStatusesByUser(user);
  }

  @ApiOperation({ description: 'Update real estate location indices' })
  @Patch('location-indices')
  @Roles(Role.Admin)
  async updateLocationIndices(): Promise<string> {
    await this.realEstateListingService.updateLocationIndices();
    return 'done';
  }

  @ApiOperation({ description: 'Update a real estate listing' })
  @Put(':id')
  async updateRealEstateListing(
    @Param('id') realEstateId: string,
    @InjectUser() user: UserDocument,
    @Body() realEstateListing: Partial<ApiUpsertRealEstateListingDto>,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      user,
      await this.realEstateListingService.updateRealEstateListing(
        user,
        realEstateId,
        realEstateListing,
      ),
    );
  }

  @ApiOperation({ description: 'Delete a real estate listing' })
  @Delete(':id')
  async deleteRealEstateListing(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
  ): Promise<void> {
    return this.realEstateListingService.deleteRealEstateListing(user, id);
  }

  // -----------------------------------------------------------------------------------

  @ApiOperation({ description: 'Import a csv file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file to upload', type: FileUploadDto })
  @Post('upload/:format')
  @UseInterceptors(FileInterceptor('file'))
  async importCsvFile(
    @Param('format') fileFormat: CsvFileFormatsEnum,
    @InjectUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<number[]> {
    return this.realEstateListingImportService.importCsvFile(
      user,
      fileFormat,
      file.buffer,
    );
  }

  @ApiOperation({ description: 'Download an example csv or xls file' })
  @Get('examples')
  downloadExampleFile(
    @Query('format') fileFormat: CsvFileFormatsEnum,
    @Query('type') fileType: ApiExampleFileTypeEnum,
  ): StreamableFile {
    let contentType: string;

    switch (fileType) {
      case ApiExampleFileTypeEnum.CSV: {
        contentType = 'text/csv';
        break;
      }

      case ApiExampleFileTypeEnum.XLS: {
        contentType = 'application/vnd.ms-excel';
        break;
      }
    }

    const path = joinPath(
      __dirname,
      `../../../assets/examples/csv-import/${fileFormat
        .toLowerCase()
        .replace('_', '-')}/example.${fileType}`,
    );

    return new StreamableFile(createReadStream(path), {
      type: contentType,
      disposition: `attachment; filename="example.${fileType}"`,
    });
  }

  @ApiOperation({ description: 'Fetch Open AI real estate description' })
  @Post('open-ai-real-estate-desc')
  async fetchOpenAiRealEstDesc(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() realEstateDescriptionQuery: ApiOpenAiRealEstDescQueryDto,
  ): Promise<string> {
    return this.realEstateListingService.fetchOpenAiRealEstateDesc(
      user,
      realEstateDescriptionQuery,
    );
  }

  @ApiOperation({ description: 'Import real estates from a specified CRM' })
  @Get('crm-import/:type')
  async importFromCrm(
    @Param('type') type: ApiRealEstateExtSourcesEnum,
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
  ): Promise<string[]> {
    return this.realEstateCrmImportService.importFromCrm(user, type);
  }

  @ApiOperation({ description: 'Test a specified CRM connection' })
  @Post('crm-test')
  async testApiConnection(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    connectSettings: ApiUserApiConnectionSettingsDto,
  ): Promise<void> {
    await this.realEstateCrmImportService.testApiConnection(
      user,
      connectSettings,
    );
  }
}
