import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

import {
  ApiShowTour,
  IApiMapboxStyle,
  LanguageTypeEnum,
  TApiUserApiConnections,
  TAreaButlerExportTypes,
} from '@area-butler-types/types';
import { intUserInitShowTour } from '../../../../shared/constants/integration';
import { foreignIdGetSet } from '../../shared/constants/schema';
import { IUserConfig } from '@area-butler-types/user';
import { IApiKeyParams } from '../../shared/types/external-api';
import { availableCountries } from '../../../../shared/constants/location';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import { IIntUserExpMatchParams } from '@area-butler-types/integration-user';

@Schema({ _id: false })
class UserConfig implements IUserConfig {
  @Prop({ type: Object })
  apiKeyParams?: IApiKeyParams;

  @Prop({ type: Object })
  externalConnections?: TApiUserApiConnections;

  @Prop({ type: String })
  fullname?: string;

  @Prop({
    type: String,
    enum: LanguageTypeEnum,
    default: LanguageTypeEnum.de,
  })
  language?: LanguageTypeEnum;

  @Prop({
    type: Object,
    default: { ...intUserInitShowTour },
  })
  studyTours?: ApiShowTour;

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
  showTour?: ApiShowTour;
}

export const UserConfigSchema = SchemaFactory.createForClass(UserConfig);
