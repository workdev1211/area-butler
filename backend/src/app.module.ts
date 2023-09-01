import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path';
import { RavenInterceptor, RavenModule } from 'nest-raven';

import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { ConfigController } from './config/config.controller';
import { FeedbackModule } from './feedback/feedback.module';
import { LocationModule } from './location/location.module';
import { PotentialCustomerModule } from './potential-customer/potential-customer.module';
import { RealEstateListingModule } from './real-estate-listing/real-estate-listing.module';
import { RoutingModule } from './routing/routing.module';
import { UserModule } from './user/user.module';
import { BillingModule } from './billing/billing.module';
import { DataProvisionModule } from './data-provision/data-provision.module';
import { HealthModule } from './health/health.module';
import { configService } from './config/config.service';
import { OnOfficeModule } from './on-office/on-office.module';
import { OpenAiModule } from './open-ai/open-ai.module';

@Module({
  imports: [
    RavenModule,
    ClientModule,
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', '..', 'static/main'),
        exclude: ['/on-office/*', '/embed/*'],
      },
      {
        serveRoot: '/on-office',
        rootPath: join(__dirname, '..', '..', 'static/on-office'),
      },
      {
        serveRoot: '/embed',
        rootPath: join(__dirname, '..', '..', 'static/embed'),
      },
    ),
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
    HealthModule,
    OnOfficeModule,
    OpenAiModule,
    ThrottlerModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
  controllers: [ConfigController],
})
export class AppModule {}
