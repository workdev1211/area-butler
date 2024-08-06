import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateExtSourcesEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GeoJsonPoint } from '../../shared/types/geo-json';
import { IApiRealEstateIntegrationParams } from '@area-butler-types/integration';
import { RealEstateIntegrationParamsSchema } from './real-estate-integration-params.schema';
import { TApiLocIndexProps } from '@area-butler-types/location-index';
import { foreignIdGetSet } from '../../shared/constants/schema';

export type RealEstateListingDocument = RealEstateListing & Document;

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class RealEstateListing implements IApiRealEstateListingSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: Object, required: true })
  location: GeoJsonPoint;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Boolean, default: true })
  showInSnippet?: boolean;

  @Prop({ type: RealEstateIntegrationParamsSchema })
  integrationParams?: IApiRealEstateIntegrationParams;

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  userId?: string;

  @Prop({
    type: String,
    enum: ApiRealEstateExtSourcesEnum,
  })
  externalSource?: ApiRealEstateExtSourcesEnum;

  @Prop({ type: String })
  externalId?: string;

  @Prop({ type: String })
  externalUrl?: string;

  @Prop({ type: Object })
  characteristics?: ApiRealEstateCharacteristics;

  @Prop({ type: Object })
  costStructure?: ApiRealEstateCost;

  @Prop({ type: Object })
  locationIndices?: TApiLocIndexProps;

  @Prop({
    type: String,
  })
  status?: string;

  @Prop({
    type: String,
  })
  status2?: string;

  @Prop({
    type: String,
  })
  type?: string;
}

export const RealEstateListingSchema =
  SchemaFactory.createForClass(RealEstateListing);
