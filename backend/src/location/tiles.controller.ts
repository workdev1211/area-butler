import { Controller, Get, Header, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { MapboxService } from '../client/mapbox/mapbox.service';

@ApiTags('tiles')
@Controller('api/location/tiles')
export class TilesController {
  constructor(private readonly mapboxService: MapboxService) {}

  @ApiOperation({ description: 'Get a tile' })
  @Get('*')
  @Header('Content-Type', 'image/png')
  async fetchTile(
    @Req() request: any,
    @Res() response: Response,
  ): Promise<void> {
    const path = request.url.replace('/api/location/tiles/', '');
    const [, , , , , z, x, y] = path.split(/[\/@]/g);

    if (z === '-1' && x === '0' && y === '0') {
      return;
    }

    const tile = await this.mapboxService.fetchTile(path);
    response.send(tile);
  }
}
