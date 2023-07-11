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

import { ZensusAtlasService } from './zensus-atlas.service';
import { RolesGuard } from '../auth/roles.guard';
import { Role, Roles } from '../auth/roles.decorator';
import FileUploadDto from '../dto/file-upload.dto';
import ApiGeometryDto from '../dto/api-geometry.dto';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { TApiDataProvision } from '@area-butler-types/types';

interface ZensusDataGeojson {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: object;
  };
  features: {
    type:
      | 'Polygon'
      | 'MultiPolygon'
      | 'Point'
      | 'MultiPoint'
      | 'LineString'
      | 'MultiLineString'
      | 'GeometryCollection'
      | 'Feature'
      | 'FeatureCollection';
    properties: object;
    geometry: {
      type:
        | 'Polygon'
        | 'MultiPolygon'
        | 'Point'
        | 'MultiPoint'
        | 'LineString'
        | 'MultiLineString'
        | 'GeometryCollection'
        | 'Feature'
        | 'FeatureCollection';
      coordinates: number[][][];
    };
  }[];
}

@ApiTags('zensus-atlas')
@Controller('api/zensus-atlas')
@UseGuards(RolesGuard)
export class ZensusAtlasController extends AuthenticatedController {
  constructor(private readonly zensusAtlasService: ZensusAtlasService) {
    super();
  }

  @ApiOperation({ description: 'upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file to upload', type: FileUploadDto })
  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const data: ZensusDataGeojson = JSON.parse(file.buffer.toString());

    //TODO: Validate Data
    await this.zensusAtlasService.createCollection(data.features);

    return 'done';
  }

  @ApiOperation({ description: 'Query the zensus atlas' })
  @Post('query')
  async query(
    @Body() query: ApiGeometryDto,
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
  ): Promise<TApiDataProvision> {
    return this.zensusAtlasService.findIntersecting(user, query);
  }
}
