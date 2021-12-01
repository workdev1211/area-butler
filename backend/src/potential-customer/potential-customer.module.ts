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
import { QuestionnaireRequest, QuestionnaireRequestSchema } from './schema/questionnaire-request.schema';
import { QuestionnaireController } from './questionnaire.controller';
import { ClientModule } from 'src/client/client.module';

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
  controllers: [PotentialCustomerController, QuestionnaireController],
  providers: [PotentialCustomerService],
})
export class PotentialCustomerModule {}
