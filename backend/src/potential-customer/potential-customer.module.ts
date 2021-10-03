import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import {
  PotentialCustomer,
  PotentialCustomerSchema,
} from './schema/potential-customer.schema';
import { PotentialCustomerController } from './potential-customer.controller';
import { PotentialCustomerService } from './potential-customer.service';
import { PotentialCustomerListener } from './listener/potential-customer.listener';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      { name: PotentialCustomer.name, schema: PotentialCustomerSchema },
    ]),
  ],
  controllers: [PotentialCustomerController],
  providers: [PotentialCustomerService, PotentialCustomerListener],
})
export class PotentialCustomerModule {}
