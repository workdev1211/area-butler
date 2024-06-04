import { Module } from '@nestjs/common';

import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { MyVivendaController } from './my-vivenda.controller';
import { MyVivendaService } from './my-vivenda.service';

@Module({
  imports: [ClientModule, UserModule],
  controllers: [MyVivendaController],
  providers: [MyVivendaService],
})
export class MyVivendaModule {}
