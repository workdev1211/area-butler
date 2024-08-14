import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

import {
  IApiMapboxStyle,
  IApiUserExportFont,
  IApiUserPoiIcons,
  TAreaButlerExportTypes,
} from '@area-butler-types/types';
import { IIntUserExpMatchParams } from '@area-butler-types/integration-user';
import { TAvailableCountries } from '@area-butler-types/location';
import { availableCountries } from '../../../../shared/constants/location';
import {
  foreignIdGetSet,
  // TEMPLATE_SNAPSHOT_PATH,
} from '../../shared/constants/schema';
import { ICompanyConfig } from '@area-butler-types/company';
// import {
//   SearchResultSnapshot,
//   SearchResultSnapshotDocument,
// } from '../../location/schema/search-result-snapshot.schema'; // TODO currently buggy

@Schema({ _id: false })
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
  exportMatching?: Record<TAreaButlerExportTypes, IIntUserExpMatchParams>;

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
  poiIcons?: IApiUserPoiIcons;

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
