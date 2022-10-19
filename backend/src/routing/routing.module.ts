import { Module } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { RoutingController } from './routing.controller';
import { PotentialCustomerModule } from '../potential-customer/potential-customer.module';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';

@Module({
  providers: [RoutingService],
  imports: [HttpModule, PotentialCustomerModule, UserModule, LocationModule],
  controllers: [RoutingController],
})
export class RoutingModule {}
