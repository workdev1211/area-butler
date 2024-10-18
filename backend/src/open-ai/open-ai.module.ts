import { forwardRef, Module } from '@nestjs/common';

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
import { OpenAiExtService } from './open-ai-ext.service';
import { OnOfficeModule } from '../on-office/on-office.module';

@Module({
  imports: [
    ClientModule,
    DataProvisionModule,
    LocationModule,
    PlaceModule,
    UserModule,
    forwardRef(() => OnOfficeModule),
  ],
  controllers: [OpenAiController, OpenAiIntController, OpenAiExtController],
  providers: [OpenAiService, OpenAiQueryService, OpenAiExtService],
  exports: [OpenAiService, OpenAiExtService],
})
export class OpenAiModule {}
