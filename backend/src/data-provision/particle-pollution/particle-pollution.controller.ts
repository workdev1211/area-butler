import { ApiGeojsonFeature } from '@area-butler-types/types';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, Roles } from 'src/auth/roles.decorator';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { ParticlePollutionService } from './particle-pollution.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import FileUploadDto from '../../dto/file-upload.dto';
import ApiGeometryDto from '../../dto/api-geometry.dto';

@ApiTags('particle-pollution')
@Controller('api/particle-pollution')
export class ParticlePollutionController extends AuthenticatedController {
  constructor(private particlePollutionService: ParticlePollutionService) {
    super();
  }

  @ApiOperation({ description: 'Upload a new file to import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file to upload', type: FileUploadDto })
  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const data: { features: ApiGeojsonFeature[] } = JSON.parse(
      file.buffer.toString(),
    );
    //TODO: Validate Data
    await this.particlePollutionService.createCollection(data.features);
    return 'done';
  }

  @ApiOperation({ description: 'Query for particle pollution data' })
  @Post('query')
  async query(@Body() query: ApiGeometryDto, @InjectUser() user: UserDocument) {
    return await this.particlePollutionService.findIntersecting(query, user);
  }
}
