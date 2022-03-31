import { Module } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { RoutingController } from './routing.controller';
import { PotentialCustomerModule } from '../potential-customer/potential-customer.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [RoutingService],
  imports: [HttpModule, PotentialCustomerModule],
  controllers: [RoutingController],
})
export class RoutingModule {}
