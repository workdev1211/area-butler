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
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailSenderService } from './client/mail/mail-sender.service';
import { RoutingModule } from './routing/routing.module';

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
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    RoutingModule,
  ],
  controllers: [ConfigController],
})
export class AppModule {}
