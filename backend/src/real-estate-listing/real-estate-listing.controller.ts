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
  ApiRealEstateStatusEnum,
} from '@area-butler-types/real-estate';
import { CsvFileFormatsEnum } from '@area-butler-types/types';
import ApiOpenAiRealEstateDescriptionQueryDto from './dto/api-open-ai-real-estate-description-query.dto';
import { RealEstateListingImportService } from './real-estate-listing-import.service';
import ApiUserApiConnectionSettingsDto from '../dto/api-user-api-connection-settings.dto';
import { RealEstateCrmImportService } from './real-estate-crm-import.service';

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

  @ApiOperation({ description: 'Get real estate listings for current user' })
  @Get('listings')
  async fetchRealEstateListings(
    @Query('status') status: ApiRealEstateStatusEnum,
    @InjectUser() user: UserDocument,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.fetchRealEstateListings(user, status)
    ).map((l) => mapRealEstateListingToApiRealEstateListing(l, user.id));
  }

  @ApiOperation({ description: 'Insert a new real estate listing' })
  @Post()
  async createRealEstateListing(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() realEstateListing: ApiUpsertRealEstateListingDto,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingService.createRealEstateListing(
        user,
        realEstateListing,
      ),
      user.id,
    );
  }

  @ApiOperation({ description: 'Update a real estate listing' })
  @Put(':id')
  async updateRealEstateListing(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
    @Body() realEstateListing: Partial<ApiUpsertRealEstateListingDto>,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingService.updateRealEstateListing(
        user,
        id,
        realEstateListing,
      ),
      user.id,
    );
  }

  @ApiOperation({ description: 'Delete a real estate listing' })
  @Delete(':id')
  async deleteRealEstateListing(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
  ) {
    await this.realEstateListingService.deleteRealEstateListing(user, id);
  }

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
    @Body() realEstateDescriptionQuery: ApiOpenAiRealEstateDescriptionQueryDto,
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
    connectionSettings: ApiUserApiConnectionSettingsDto,
  ): Promise<void> {
    await this.realEstateCrmImportService.testApiConnection(
      user,
      connectionSettings,
    );
  }
}
