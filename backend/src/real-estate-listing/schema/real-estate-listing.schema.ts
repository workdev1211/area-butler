import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateStatusEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GeoJsonPoint } from '../../shared/geo-json.types';
import { IntegrationParamsSchema } from '../../shared/integration-params.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';

export type RealEstateListingDocument = RealEstateListing & Document;

@Schema()
export class RealEstateListing implements IApiRealEstateListingSchema {
  @Prop()
  userId: string;

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

  @Prop({ default: ApiRealEstateStatusEnum.IN_PREPARATION })
  status: ApiRealEstateStatusEnum;

  @Prop({ type: String })
  externalId: string;

  @Prop({ type: IntegrationParamsSchema })
  integrationParams: IApiIntegrationParams;
}

export const RealEstateListingSchema =
  SchemaFactory.createForClass(RealEstateListing);
