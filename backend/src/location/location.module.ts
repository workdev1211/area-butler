import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ClientModule } from 'src/client/client.module';
import { UserModule } from 'src/user/user.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import {
  LocationSearch,
  LocationSearchschema,
} from './schema/location-search.schema';

@Module({
  imports: [
    ClientModule,
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      { name: LocationSearch.name, schema: LocationSearchschema },
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
