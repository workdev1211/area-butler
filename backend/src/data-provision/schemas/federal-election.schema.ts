import { ApiGeojsonType, ApiGeometry } from '@area-butler-types/types';
import { Prop, raw, SchemaFactory } from '@nestjs/mongoose';
import { FederalElectionFeatureProperties } from '../federal-election/federal-election.types';

export type FederalElectionDocument = FederalElection & Document;

export class FederalElection {

    @Prop()
    type: ApiGeojsonType;
  
    @Prop(raw({}))
    properties: FederalElectionFeatureProperties;
  
    @Prop(
      raw({
        type: { type: String },
        coordinates: { type: [[[[Number]]]] },
      }),
    )
    geometry: ApiGeometry;

}

export const FederalElectionSchema = SchemaFactory.createForClass(FederalElection);