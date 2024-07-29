import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { OpenAiController } from './open-ai.controller';
import { OpenAiService } from './open-ai.service';
import { OpenAiIntController } from './open-ai-int.controller';
import { OpenAiExtController } from './open-ai-ext.controller';
import { DataProvisionModule } from '../data-provision/data-provision.module';
import { PlaceModule } from '../place/place.module';
import { ClientModule } from '../client/client.module';
import { OpenAiQueryService } from './open-ai-query.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    ClientModule,
    DataProvisionModule,
    LocationModule,
    PlaceModule,
    UserModule,
  ],
  controllers: [OpenAiController, OpenAiIntController, OpenAiExtController],
  providers: [OpenAiService, OpenAiQueryService],
  exports: [OpenAiService],
})
export class OpenAiModule {}
