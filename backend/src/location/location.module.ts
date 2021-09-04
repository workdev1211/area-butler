import { Module } from '@nestjs/common';
import { ClientModule } from 'src/client/client.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [ClientModule],
  controllers: [LocationController],
  providers: [LocationService]
})
export class LocationModule {}
