import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateExtSourcesEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GeoJsonPoint } from '../../shared/geo-json.types';
import { IApiRealEstateIntegrationParams } from '@area-butler-types/integration';
import { RealEstateIntegrationParamsSchema } from '../../shared/real-estate-integration-params.schema';
import { TApiLocIndexProps } from '@area-butler-types/location-index';

export type RealEstateListingDocument = RealEstateListing & Document;

@Schema()
export class RealEstateListing implements IApiRealEstateListingSchema {
  @Prop()
  userId: string;

  @Prop({ type: RealEstateIntegrationParamsSchema })
  integrationParams: IApiRealEstateIntegrationParams;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  externalUrl: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Boolean, default: true })
  showInSnippet: boolean;

  @Prop({ type: Object })
  costStructure: ApiRealEstateCost;

  @Prop({ type: Object })
  characteristics: ApiRealEstateCharacteristics;

  @Prop({ type: Object, required: true })
  location: GeoJsonPoint;

  @Prop({ type: Object })
  locationIndices: TApiLocIndexProps;

  @Prop({
    type: String,
  })
  status: string;

  @Prop({
    type: String,
  })
  status2: string;

  @Prop({
    type: String,
    enum: ApiRealEstateExtSourcesEnum,
  })
  externalSource: ApiRealEstateExtSourcesEnum;

  @Prop({ type: String })
  externalId: string;
}

export const RealEstateListingSchema =
  SchemaFactory.createForClass(RealEstateListing);
