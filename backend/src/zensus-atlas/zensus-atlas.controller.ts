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

interface ZensusDataGeojson {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: object;
  };
  features: {
    type: string;
    properties: object;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }[];
}

@Controller('api/zensus-atlas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ZensusAtlasController {
  constructor(private readonly zensusAtlasService: ZensusAtlasService) {}

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
  query(@Body() query: ApiGeometry) {
    return this.zensusAtlasService.findIntersecting(query);
  }
}
