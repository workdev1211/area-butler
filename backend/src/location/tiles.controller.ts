import { Controller, Get, Header, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { MapboxService } from "src/client/mapbox/mapbox.service";

@Controller('api/location/tiles')
export class TilesController {

    constructor(private mapboxService: MapboxService) {}

    @Get('*')
    @Header('Content-Type', 'image/png')
    async fetchTile(@Req() request: any, @Res() response: Response) {
        const path = request.url.replace('/api/location/tiles/', '');
        const tile = await this.mapboxService.fetchTile(path);
        response.send(tile);
    }
}