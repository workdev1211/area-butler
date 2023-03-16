import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeCreateOrderProduct,
} from '@area-butler-types/on-office';

export type TOnOfficeTransactionDocument = OnOfficeTransaction & Document;

@Schema({ timestamps: true })
export class OnOfficeTransaction {
  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ required: true, type: Object })
  product: IApiOnOfficeCreateOrderProduct;

  @Prop({ type: String, unique: true })
  transactionId: string;

  @Prop({ type: String })
  referenceId: string;

  @Prop({
    type: String,
    enum: ApiOnOfficeTransactionStatusesEnum,
  })
  status: ApiOnOfficeTransactionStatusesEnum;
}

export const OnOfficeTransactionSchema =
  SchemaFactory.createForClass(OnOfficeTransaction);
