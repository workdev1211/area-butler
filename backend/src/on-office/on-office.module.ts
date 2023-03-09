import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { OnOfficeService } from './on-office.service';
import { OnOfficeIntegrationController } from './on-office-integration.controller';
import { OnOfficeShopController } from './on-office-shop.controller';
import { ClientModule } from '../client/client.module';
import { checkSignature } from './middleware/check-signature.middleware';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [ClientModule, UserModule, LocationModule],
  controllers: [OnOfficeIntegrationController, OnOfficeShopController],
  providers: [OnOfficeService],
})
export class OnOfficeModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(checkSignature).forRoutes(
      // TODO remove in future
      {
        path: 'api/on-office/activation-iframe',
        method: RequestMethod.GET,
      },
      {
        path: 'api/on-office-integration/activation-iframe',
        method: RequestMethod.GET,
      },
      {
        path: 'api/on-office-shop/activation-iframe',
        method: RequestMethod.GET,
      },
    );
  }
}
