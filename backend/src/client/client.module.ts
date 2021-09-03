import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeocodingService } from './geocoding/geocoding.service';

@Module({
  providers: [GeocodingService],
  imports: [ConfigModule],
  exports: [GeocodingService],
})
export class ClientModule {}
