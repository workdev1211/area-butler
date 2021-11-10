import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZensusAtlasService } from './zensus-atlas.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Role, Roles } from '../auth/roles.decorator';
import { ApiGeometry } from '@area-butler-types/types';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';

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

@Controller('api/zensus-atlas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ZensusAtlasController extends AuthenticatedController {
  constructor(private readonly zensusAtlasService: ZensusAtlasService) {
    super();
  }

  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const data: ZensusDataGeojson = JSON.parse(file.buffer.toString());
    //TODO: Validate Data
    await this.zensusAtlasService.createCollection(data.features);
    return 'done';
  }

  @Post('query')
  async query(@Body() query: ApiGeometry, @InjectUser() user: UserDocument) {
    return (await this.zensusAtlasService.findIntersecting(user, query)).map(
      (d: any) => {
        if (!!d?.properties?.Frauen_A) {
          delete d?.properties?.Frauen_A;
        }
        return d;
      },
    );
  }
}
