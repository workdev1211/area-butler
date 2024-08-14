import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

import {
  ApiShowTour,
  IApiMapboxStyle,
  LanguageTypeEnum,
  TAreaButlerExportTypes,
} from '@area-butler-types/types';
import {
  IIntUserExpMatchParams,
  TApiIntegrationUserConfig,
} from '@area-butler-types/integration-user';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import { availableCountries } from '../../../../shared/constants/location';
import { intUserInitShowTour } from '../../../../shared/constants/integration';
import { foreignIdGetSet } from '../../shared/constants/schema';

@Schema({ _id: false })
class IntUserConfig implements TApiIntegrationUserConfig {
  // TODO remove?
  @Prop({ type: Boolean })
  hideProductPage?: boolean;

  @Prop({
    type: String,
    enum: LanguageTypeEnum,
    default: LanguageTypeEnum.de,
  })
  language?: LanguageTypeEnum;

  // TODO should be renamed to 'studyTours'
  @Prop({
    type: Object,
    default: { ...intUserInitShowTour },
  })
  showTour?: ApiShowTour;

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
}

export const IntUserConfigSchema = SchemaFactory.createForClass(IntUserConfig);
