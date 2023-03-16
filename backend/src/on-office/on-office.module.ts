import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OnOfficeService } from './on-office.service';
import { OnOfficeController } from './on-office.controller';
import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';
import {
  OnOfficeTransaction,
  OnOfficeTransactionSchema,
} from './schema/on-office-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnOfficeTransaction.name, schema: OnOfficeTransactionSchema },
    ]),
    ClientModule,
    UserModule,
    LocationModule,
  ],
  controllers: [OnOfficeController],
  providers: [OnOfficeService],
})
export class OnOfficeModule {}
