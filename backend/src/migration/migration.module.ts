import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { Company, CompanySchema } from '../company/schema/company.schema';
import {
  IntegrationUser,
  IntegrationUserSchema,
} from '../user/schema/integration-user.schema';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    MongooseModule.forFeature([
      { name: IntegrationUser.name, schema: IntegrationUserSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
  ],
  controllers: [MigrationController],
  providers: [MigrationService],
})
export class MigrationModule {}
