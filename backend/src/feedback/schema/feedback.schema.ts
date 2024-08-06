import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import { FeedbackType } from '@area-butler-types/types';
import { foreignIdGetSet } from '../../shared/constants/schema';

export type FeedbackDocument = Feedback & Document;

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Feedback {
  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  userId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: FeedbackType;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
