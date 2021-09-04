import { HttpModule, Module } from '@nestjs/common';
import { GeocodingService } from './geocoding/geocoding.service';
import { IsochroneService } from './isochrone/isochrone.service';
import { OverpassService } from './overpass/overpass.service';

@Module({
  providers: [GeocodingService, OverpassService, IsochroneService],
  imports: [HttpModule],
  exports: [GeocodingService, OverpassService, IsochroneService],
})
export class ClientModule {}
