import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

import {
  TApiUserStudyTours,
  LanguageTypeEnum,
  TApiUserExtConnections,
} from '@area-butler-types/types';
import { foreignIdGetSet } from '../../shared/constants/schema';
import { IUserConfig } from '@area-butler-types/user';
import { IApiKeyParams } from '../../shared/types/external-api';
import { userInitStudyTours } from '../../../../shared/constants/constants';

@Schema({
  _id: false,
  toJSON: { getters: true },
  toObject: { getters: true },
})
class UserConfig implements IUserConfig {
  @Prop({
    type: String,
    enum: LanguageTypeEnum,
    default: LanguageTypeEnum.de,
  })
  language: LanguageTypeEnum;

  @Prop({
    type: Object,
    default: { ...userInitStudyTours },
  })
  studyTours: TApiUserStudyTours;

  @Prop({ type: Object })
  apiKeyParams?: IApiKeyParams;

  @Prop({ type: Object })
  externalConnections?: TApiUserExtConnections;

  @Prop({ type: String })
  fullname?: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  templateSnapshotId?: string;
}

export const UserConfigSchema = SchemaFactory.createForClass(UserConfig);
