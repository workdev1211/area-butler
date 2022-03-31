import { Controller, Get, Header, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { MapboxService } from 'src/client/mapbox/mapbox.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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
