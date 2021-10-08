import {HttpModule, Module} from '@nestjs/common';
import { RoutingService } from './routing.service';
import { RoutingController } from './routing.controller';

@Module({
  providers: [RoutingService],
  imports: [HttpModule],
  controllers: [RoutingController],
})
export class RoutingModule {}
