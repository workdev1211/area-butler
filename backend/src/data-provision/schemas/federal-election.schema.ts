import { ApiFederalElectionFeatureProperties } from '@area-butler-types/federal-election';
import { ApiGeojsonType, ApiGeometry } from '@area-butler-types/types';
import { Prop, raw, SchemaFactory } from '@nestjs/mongoose';

export type FederalElectionDocument = FederalElection & Document;

export class FederalElection {

    @Prop()
    type: ApiGeojsonType;
  
    @Prop(raw({}))
    properties: ApiFederalElectionFeatureProperties;
  
    @Prop(
      raw({
        type: { type: String },
        coordinates: { type: [[[[Number]]]] },
      }),
    )
    geometry: ApiGeometry;

}

export const FederalElectionSchema = SchemaFactory.createForClass(FederalElection);