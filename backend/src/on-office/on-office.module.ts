import { Module } from '@nestjs/common';

import { OnOfficeService } from './on-office.service';
import { OnOfficeController } from './on-office.controller';
import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [ClientModule, UserModule, LocationModule],
  controllers: [OnOfficeController],
  providers: [OnOfficeService],
})
export class OnOfficeModule {}
