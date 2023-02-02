import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { OpenAiController } from './open-ai.controller';
import { OpenAiService } from './open-ai.service';

@Module({
  imports: [ClientModule, HttpModule, UserModule],
  providers: [OpenAiService],
  controllers: [OpenAiController],
  exports: [OpenAiService],
})
export class OpenAiModule {}
