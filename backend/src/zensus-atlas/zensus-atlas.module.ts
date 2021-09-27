import { Module } from '@nestjs/common';

import { ZensusAtlasService } from './zensus-atlas.service';
import { ZensusAtlasController } from './zensus-atlas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ZensusAtlas, ZensusAtlasSchema } from './schema/zensus-atlas.schema';

@Module({
  controllers: [ZensusAtlasController],
  providers: [ZensusAtlasService],
  imports: [
    MongooseModule.forFeature([
      { name: ZensusAtlas.name, schema: ZensusAtlasSchema },
    ]),
  ],
})
export class ZensusAtlasModule {}
