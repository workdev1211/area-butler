import { HttpModule, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ClientModule } from './client/client.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [ClientModule, 
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'static'),
    }),
    HttpModule,
    LocationModule],
})
export class AppModule {}
