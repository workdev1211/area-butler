import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import { foreignIdGetSet } from '../../shared/constants/schema';

export type QuestionnaireRequestDocument = QuestionnaireRequest & Document;

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class QuestionnaireRequest {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    ...foreignIdGetSet,
  })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  token: string;

  @Prop()
  userInCopy: boolean;
}

export const QuestionnaireRequestSchema =
  SchemaFactory.createForClass(QuestionnaireRequest);
