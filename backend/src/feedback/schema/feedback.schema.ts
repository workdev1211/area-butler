import { FeedbackType } from '@area-butler-types/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

export type FeedbackDocument = Feedback & Document;

@Schema()
export class Feedback {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: FeedbackType;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
