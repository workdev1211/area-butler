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
  Res,
  StreamableFile,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join as joinPath } from 'path';

import { mapRealEstateListingToApiRealEstateListing } from './mapper/real-estate-listing.mapper';
import { RealEstateListingService } from './real-estate-listing.service';
import ApiRealEstateListingDto from '../dto/api-real-estate-listing.dto';
import ApiUpsertRealEstateListingDto from '../dto/api-upsert-real-estate-listing.dto';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import FileUploadDto from '../dto/file-upload.dto';
import {
  ApiExampleFileTypeEnum,
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from '@area-butler-types/real-estate';
import { CsvFileFormatsEnum } from '@area-butler-types/types';
import ApiOpenAiRealEstateDescriptionQueryDto from './dto/api-open-ai-real-estate-description-query.dto';
import { RealEstateListingImportService } from './real-estate-listing-import.service';

@ApiTags('real-estate-listing')
@Controller('api/real-estate-listing')
export class RealEstateListingController extends AuthenticatedController {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly realEstateListingImportService: RealEstateListingImportService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Get real estate listings for current user' })
  @Get('listings')
  async fetchRealEstateListings(
    @InjectUser() user: UserDocument,
    @Query('status') status: ApiRealEstateStatusEnum,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.fetchRealEstateListings(user, status)
    ).map((l) => mapRealEstateListingToApiRealEstateListing(l, user.id));
  }

  @ApiOperation({ description: 'Insert a new real estate listing' })
  @Post()
  async insertRealEstateListing(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() realEstateListing: ApiUpsertRealEstateListingDto,
  ): Promise<ApiRealEstateListingDto> {
    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingService.insertRealEstateListing(
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
  ): Promise<ApiRealEstateListingDto> {
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
    @InjectUser() user: UserDocument,
    @Param('format') fileFormat: CsvFileFormatsEnum,
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
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    switch (fileType) {
      case ApiExampleFileTypeEnum.CSV: {
        res.set({
          'Content-Type': 'text/csv',
        });

        break;
      }

      case ApiExampleFileTypeEnum.XLS: {
        res.set({
          'Content-Type': 'application/vnd.ms-excel',
        });

        break;
      }
    }

    res.set({
      'Content-Disposition': `attachment; filename="example.${fileType}"`,
    });

    const path = joinPath(
      __dirname,
      `../../../assets/examples/csv-import/${fileFormat
        .toLowerCase()
        .replace('_', '-')}/example.${fileType}`,
    );

    return new StreamableFile(createReadStream(path));
  }

  @ApiOperation({ description: 'Fetch Open AI real estate description' })
  @Post('open-ai-real-estate-desc')
  async fetchOpenAiRealEstateDescription(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() realEstateDescriptionQuery: ApiOpenAiRealEstateDescriptionQueryDto,
  ): Promise<string> {
    return this.realEstateListingService.fetchOpenAiRealEstateDesc(
      user,
      realEstateDescriptionQuery,
    );
  }
}
