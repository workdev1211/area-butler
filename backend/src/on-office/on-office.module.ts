import { Module } from '@nestjs/common';

import { OnOfficeService } from './on-office.service';
import { OnOfficeIntegrationController } from './on-office-integration.controller';
import { OnOfficeShopController } from './on-office-shop.controller';
import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [ClientModule, UserModule, LocationModule],
  controllers: [OnOfficeIntegrationController, OnOfficeShopController],
  providers: [OnOfficeService],
})
export class OnOfficeModule {}
