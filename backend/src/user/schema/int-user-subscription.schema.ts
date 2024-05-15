import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IIntUserSubscription } from '@area-butler-types/integration-user';

@Schema({ _id: false })
class IntUserSubscription implements IIntUserSubscription {
  @Prop({ required: true, type: Date })
  expiresAt: Date;
}

export const IntUserSubscriptionSchema =
  SchemaFactory.createForClass(IntUserSubscription);
