import { Module } from '@nestjs/common';

import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { CompanyUserService } from './company-user.service';
import { CompanyUserController } from './company-user.controller';
import { CompanyUserIntController } from './company-user-int.controller';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [CompanyModule, LocationModule, UserModule],
  controllers: [CompanyUserController, CompanyUserIntController],
  providers: [CompanyUserService],
})
export class CompanyUserModule {}
