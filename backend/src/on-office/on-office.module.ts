import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { OnOfficeService } from './on-office.service';
import { OnOfficeController } from './on-office.controller';
import { ClientModule } from '../client/client.module';
import { checkSignature } from './middleware/check-signature.middleware';

@Module({
  imports: [ClientModule],
  controllers: [OnOfficeController],
  providers: [OnOfficeService],
})
export class OnOfficeModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(checkSignature)
      .forRoutes({
        path: 'api/on-office/activation-iframe',
        method: RequestMethod.GET,
      });
  }
}
