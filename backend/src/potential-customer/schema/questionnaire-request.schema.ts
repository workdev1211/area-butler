import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionnaireRequestDocument = QuestionnaireRequest & Document;

@Schema()
export class QuestionnaireRequest {
  @Prop({ required: true })
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

export const QuestionnaireRequestSchema = SchemaFactory.createForClass(
  QuestionnaireRequest,
);
