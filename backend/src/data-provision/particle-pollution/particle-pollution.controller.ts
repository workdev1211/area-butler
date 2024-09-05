import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiGeojsonFeature } from '@area-butler-types/types';
import { ParticlePollutionService } from './particle-pollution.service';
import FileUploadDto from '../../dto/file-upload.dto';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { Roles, Role } from '../../auth/role/roles.decorator';
import { AuthenticatedController } from '../../shared/authenticated.controller';
import { InjectUser } from '../../user/inject-user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { ParticlePollutionDocument } from '../schemas/particle-pollution.schema';

@ApiTags('particle-pollution')
@Controller('api/particle-pollution')
export class ParticlePollutionController extends AuthenticatedController {
  constructor(
    private readonly particlePollutionService: ParticlePollutionService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Upload a new file to import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file to upload', type: FileUploadDto })
  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    const data: { features: ApiGeojsonFeature[] } = JSON.parse(
      file.buffer.toString(),
    );

    // TODO Validate Data
    await this.particlePollutionService.createCollection(data.features);

    return 'done';
  }

  @ApiOperation({ description: 'Query for particle pollution data' })
  @Post('query')
  async query(
    @InjectUser() user: UserDocument,
    @Body() query: ApiGeometryDto,
  ): Promise<ParticlePollutionDocument[]> {
    return this.particlePollutionService.findIntersecting(user, query);
  }
}
