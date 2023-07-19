import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { ZensusAtlasService } from './zensus-atlas.service';
import { ZensusAtlasController } from './zensus-atlas.controller';
import { ZensusAtlas, ZensusAtlasSchema } from './schema/zensus-atlas.schema';
import { UserModule } from '../user/user.module';
import {
  ZipLevelData,
  ZipLevelDataSchema,
} from '../data-provision/schemas/zip-level-data.schema';
import { ZensusAtlasIntController } from './zensus-atlas-int.controller';
import { ZensusAtlasExtController } from './zensus-atlas-ext.controller';
import { ClientModule } from '../client/client.module';

@Module({
  controllers: [
    ZensusAtlasController,
    ZensusAtlasIntController,
    ZensusAtlasExtController,
  ],
  providers: [ZensusAtlasService],
  imports: [
    UserModule,
    ClientModule,
    MongooseModule.forFeature([
      { name: ZensusAtlas.name, schema: ZensusAtlasSchema },
      { name: ZipLevelData.name, schema: ZipLevelDataSchema },
    ]),
  ],
})
export class ZensusAtlasModule {}
