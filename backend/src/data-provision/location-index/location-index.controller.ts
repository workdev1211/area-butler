import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationIndexService } from './location-index.service';
import FileUploadDto from '../../dto/file-upload.dto';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { Roles, Role } from '../../auth/role/roles.decorator';
import { RolesGuard } from '../../auth/role/roles.guard';
import { AuthenticatedController } from '../../shared/authenticated.controller';
import { InjectUser } from '../../user/inject-user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { IApiLocIndexFeature } from '@area-butler-types/location-index';
import { LocationIndexDocument } from '../schemas/location-index.schema';

@ApiTags('location-index')
@Controller('api/location-index')
@UseGuards(RolesGuard)
export class LocationIndexController extends AuthenticatedController {
  constructor(private readonly locationIndexService: LocationIndexService) {
    super();
  }

  @ApiOperation({ description: 'Upload a new file to import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file to upload', type: FileUploadDto })
  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    const data: { features: IApiLocIndexFeature[] } = JSON.parse(
      file.buffer.toString(),
    );

    // TODO: Validate Data
    await this.locationIndexService.createCollection(data.features);

    return 'done';
  }

  @ApiOperation({ description: 'Query for location index data' })
  @Post('query')
  async query(
    @InjectUser() user: UserDocument,
    @Body() queryData: ApiGeometryDto,
  ): Promise<LocationIndexDocument[]> {
    return this.locationIndexService.queryWithUser(user, queryData);
  }
}
