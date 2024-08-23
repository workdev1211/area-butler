import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

import {
  TApiUserStudyTours,
  IApiMapboxStyle,
  LanguageTypeEnum,
  TApiUserExtConnections,
  TAreaButlerExportTypes,
} from '@area-butler-types/types';
import { foreignIdGetSet } from '../../shared/constants/schema';
import { IUserConfig } from '@area-butler-types/user';
import { IApiKeyParams } from '../../shared/types/external-api';
import { availableCountries } from '../../../../shared/constants/location';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import { IIntUserExpMatchParams } from '@area-butler-types/integration-user';
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

  // OLD

  @Prop({
    type: Array,
    enum: availableCountries,
  })
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[];

  @Prop({ type: String })
  color?: string;

  @Prop({ type: Object })
  exportMatching?: Record<TAreaButlerExportTypes, IIntUserExpMatchParams>;

  @Prop({
    type: Array,
  })
  extraMapboxStyles?: IApiMapboxStyle[];

  @Prop({ type: Boolean })
  isSpecialLink?: boolean;

  @Prop({ type: String })
  logo?: string;

  @Prop({ type: String })
  mapboxAccessToken?: string;

  @Prop({ type: String })
  mapIcon?: string;

  @Prop({ type: Object })
  showTour?: TApiUserStudyTours;
}

export const UserConfigSchema = SchemaFactory.createForClass(UserConfig);
