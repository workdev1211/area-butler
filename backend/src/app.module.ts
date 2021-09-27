import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { ConfigController } from './config/config.controller';
import { configService } from './config/config.service';
import { LocationModule } from './location/location.module';
import { UserModule } from './user/user.module';
import { RealEstateListingModule } from './real-estate-listing/real-estate-listing.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PotentialCustomerModule } from './potential-customer/potential-customer.module';
import { ZensusAtlasModule } from './zensus-atlas/zensus-atlas.module';

@Module({
  imports: [
    ClientModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'static'),
    }),
    MongooseModule.forRoot(configService.getMongoConnectionUri()),
    HttpModule,
    LocationModule,
    AuthModule,
    UserModule,
    RealEstateListingModule,
    FeedbackModule,
    PotentialCustomerModule,
    ZensusAtlasModule,
  ],
  controllers: [ConfigController],
})
export class AppModule {}
