import { Controller, Get, Header, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MapboxService } from '../client/mapbox/mapbox.service';

@ApiTags('tiles')
@Controller('api/location/tiles')
export class TilesController {
  constructor(private mapboxService: MapboxService) {}

  @ApiOperation({ description: 'Get a tile' })
  @Get('*')
  @Header('Content-Type', 'image/png')
  async fetchTile(@Req() request: any, @Res() response: Response) {
    const path = request.url.replace('/api/location/tiles/', '');
    const tile = await this.mapboxService.fetchTile(path);
    response.send(tile);
  }
}
