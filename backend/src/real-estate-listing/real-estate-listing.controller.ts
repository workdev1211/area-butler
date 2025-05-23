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
import FileUploadDto from '../dto/file-upload.dto';
import {
  ApiExampleFileTypeEnum,
  ApiRealEstateExtSourcesEnum,
  ApiRealEstateListing,
  IApiRealEstStatusByUser,
} from '@area-butler-types/real-estate';
import { CsvFileFormatEnum } from '@area-butler-types/types';
import { RealEstateListingImportService } from './real-estate-listing-import.service';
import { RealEstateCrmImportService } from './real-estate-crm-import.service';
import { Role, Roles } from '../auth/role/roles.decorator';
import ApiUserExtConnectSettingsReqDto from '../user/dto/api-user-ext-connect-settings-req.dto';
import { replaceValInObj } from '../../../shared/functions/shared.functions';

@ApiTags('real-estate-listing')
@Controller('api/real-estate-listing')
export class RealEstateListingController extends AuthenticatedController {
  constructor(
    private readonly realEstateCrmImportService: RealEstateCrmImportService,
    private readonly realEstateListingImportService: RealEstateListingImportService,
    private readonly realEstateListingService: RealEstateListingService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Insert a new real estate listing' })
  @Post()
  async createRealEstateListing(
    @InjectUser() user: UserDocument,
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
    @Query('status2') status2: string,
    @InjectUser() user: UserDocument,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.fetchRealEstateListings(user, {
        status,
        status2,
      })
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
    @Body() realEstate: ApiUpsertRealEstateListingDto,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      user,
      await this.realEstateListingService.updateRealEstateListing(
        user,
        realEstateId,
        replaceValInObj(realEstate, null, undefined),
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
    @Param('format') fileFormat: CsvFileFormatEnum,
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
    @Query('format') fileFormat: CsvFileFormatEnum,
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

  @ApiOperation({ description: 'Import real estates from a specified CRM' })
  @Get('crm-import/:type')
  async importFromCrm(
    @Param('type') type: ApiRealEstateExtSourcesEnum,
    @InjectUser() user: UserDocument,
  ): Promise<string[]> {
    return this.realEstateCrmImportService.importFromCrm(user, type);
  }

  @ApiOperation({ description: 'Test a specified CRM connection' })
  @Post('crm-test')
  testExtConnection(
    @InjectUser() user: UserDocument,
    @Body()
    connectSettings: ApiUserExtConnectSettingsReqDto,
  ): Promise<void> {
    return this.realEstateCrmImportService.testExtConnection(
      user,
      connectSettings,
    );
  }
}
