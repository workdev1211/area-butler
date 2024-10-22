import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  PotentialCustomer,
  PotentialCustomerSchema,
} from './schema/potential-customer.schema';
import { PotentialCustomerController } from './potential-customer.controller';
import { PotentialCustomerService } from './potential-customer.service';
import {
  QuestionnaireRequest,
  QuestionnaireRequestSchema,
} from './schema/questionnaire-request.schema';
import { QuestionnaireController } from './questionnaire.controller';
import { AuthModule } from '../auth/auth.module';
import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { PotentialCustomerListener } from './listener/potential-customer.listener';
import { PotentialCustomerIntController } from './potential-customer-int.controller';

@Module({
  imports: [
    ClientModule,
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      { name: PotentialCustomer.name, schema: PotentialCustomerSchema },
      { name: QuestionnaireRequest.name, schema: QuestionnaireRequestSchema },
    ]),
  ],
  controllers: [
    PotentialCustomerController,
    PotentialCustomerIntController,
    QuestionnaireController,
  ],
  providers: [PotentialCustomerService, PotentialCustomerListener],
  exports: [PotentialCustomerService],
})
export class PotentialCustomerModule {}
