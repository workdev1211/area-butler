import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeocodingService } from './geocoding/geocoding.service';
import { OverpassService } from './overpass/overpass.service';
import { IsochroneService } from './isochrone/isochrone.service';

@Module({
  providers: [GeocodingService, OverpassService, IsochroneService],
  imports: [ConfigModule, HttpModule],
  exports: [GeocodingService, OverpassService, IsochroneService],
})
export class ClientModule {}
