import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ClientModule } from 'src/client/client.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [ClientModule, AuthModule],
  controllers: [LocationController],
  providers: [LocationService]
})
export class LocationModule {}
