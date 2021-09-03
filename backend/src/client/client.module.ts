import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeocodingService } from './geocoding/geocoding.service';
import { OverpassService } from './overpass/overpass.service';

@Module({
  providers: [GeocodingService, OverpassService],
  imports: [ConfigModule, HttpModule],
  exports: [GeocodingService, OverpassService],
})
export class ClientModule {}
