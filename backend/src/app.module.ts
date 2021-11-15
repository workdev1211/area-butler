import { HttpModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { ConfigController } from './config/config.controller';
import { configService } from './config/config.service';
import { FeedbackModule } from './feedback/feedback.module';
import { LocationModule } from './location/location.module';
import { PotentialCustomerModule } from './potential-customer/potential-customer.module';
import { RealEstateListingModule } from './real-estate-listing/real-estate-listing.module';
import { RoutingModule } from './routing/routing.module';
import { CustomExceptionFilter } from './shared/custom-exception.filter';
import { UserModule } from './user/user.module';
import { ZensusAtlasModule } from './zensus-atlas/zensus-atlas.module';
import { BillingModule } from './billing/billing.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DataProvisionModule } from './data-provision/data-provision.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ClientModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'static'),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(configService.getMongoConnectionUri()),
    HttpModule,
    LocationModule,
    AuthModule,
    UserModule,
    HealthModule,
    RealEstateListingModule,
    FeedbackModule,
    PotentialCustomerModule,
    ZensusAtlasModule,
    DataProvisionModule,
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
    BillingModule,
    HealthModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
  controllers: [ConfigController],
})
export class AppModule {}
