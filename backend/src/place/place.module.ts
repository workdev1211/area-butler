import { Module } from '@nestjs/common';

import { ClientModule } from '../client/client.module';
import { PlaceService } from './place.service';

@Module({
  imports: [ClientModule],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {}
