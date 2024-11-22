import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

import {
  IApiMapboxStyle,
  IApiUserExportFont,
  IApiPoiIcons,
} from '@area-butler-types/types';
import { TAvailableCountries } from '@area-butler-types/location';
import { availableCountries } from '../../../../shared/constants/location';
import {
  foreignIdGetSet,
  // TEMPLATE_SNAPSHOT_PATH,
} from '../../shared/constants/schema';
import {
  ICompanyConfig,
  TCompanyExportMatch,
  TCompanyPresets,
} from '@area-butler-types/company';
// import {
//   SearchResultSnapshot,
//   SearchResultSnapshotDocument,
// } from '../../location/schema/search-result-snapshot.schema'; // TODO currently buggy

@Schema({
  _id: false,
  toJSON: { getters: true },
  toObject: { getters: true },
})
class CompanyConfig implements ICompanyConfig {
  @Prop({
    type: Array,
    enum: availableCountries,
  })
  allowedCountries?: TAvailableCountries[];

  @Prop({ type: String })
  color?: string;

  @Prop({ type: Array })
  exportFonts?: IApiUserExportFont[];

  @Prop({ type: Object })
  exportMatching?: TCompanyExportMatch;

  @Prop({ type: Array })
  extraMapboxStyles?: IApiMapboxStyle[];

  @Prop({ type: Boolean })
  isSpecialLink?: boolean;

  @Prop({ type: String })
  logo?: string;

  @Prop({ type: String })
  mapboxAccessToken?: string;

  @Prop({ type: String })
  mapIcon?: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: Object })
  poiIcons?: IApiPoiIcons;

  @Prop({ type: Object })
  presets?: TCompanyPresets;

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  templateSnapshotId?: string;

  // templateSnapshot?: SearchResultSnapshotDocument; // TODO currently buggy
}

export const CompanyConfigSchema = SchemaFactory.createForClass(CompanyConfig);

// TODO currently buggy
// CompanyConfigSchema.virtual(TEMPLATE_SNAPSHOT_PATH, {
//   ref: SearchResultSnapshot.name,
//   localField: 'templateSnapshotId',
//   foreignField: '_id',
//   justOne: true,
// });
