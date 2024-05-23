import {
  Controller,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { InjectUser } from '../../user/inject-user.decorator';
import { ApiOpenImmoService } from './api-open-immo.service';
import { UserSubscriptionPipe } from '../../pipe/user-subscription.pipe';
import { UserDocument } from '../../user/schema/user.schema';
import { RealEstateListingImportService } from '../real-estate-listing-import.service';
import FileUploadDto from '../../dto/file-upload.dto';
import { CsvFileFormatEnum } from '@area-butler-types/types';
import { Role, Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';

@ApiTags('api-real-estate-listing-import')
@Controller('api/real-estate-listing/import')
@UseGuards(AuthGuard('api-key'), RolesGuard)
export class ApiRealEstateListingImportController {
  constructor(
    private readonly apiOpenImmoService: ApiOpenImmoService,
    private readonly realEstateListingImportService: RealEstateListingImportService,
  ) {}

  @ApiOperation({
    description: 'Import OpenImmo data received in XML format',
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('open-immo-xml')
  async importOpenImmoXmlFile(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HttpStatus> {
    await this.realEstateListingImportService.importXmlFile(user, file.buffer);
    return HttpStatus.OK;
  }

  @ApiOperation({
    description: 'Trigger the import of xml files from FTP folder',
  })
  @Roles(Role.Admin)
  @Post('trigger-open-immo-ftp-import')
  async triggerFtpImport(): Promise<HttpStatus> {
    await this.apiOpenImmoService.handleFtpImport();
    return HttpStatus.OK;
  }

  @ApiOperation({ description: 'Import a csv file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file to upload', type: FileUploadDto })
  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsvFile(
    @InjectUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
    @Query('format') fileFormat: CsvFileFormatEnum,
  ): Promise<number[]> {
    return this.realEstateListingImportService.importCsvFile(
      user,
      fileFormat,
      file.buffer,
    );
  }
}
