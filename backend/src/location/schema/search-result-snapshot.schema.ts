import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaType, Types } from 'mongoose';

import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  IIframeTokens,
} from '@area-butler-types/types';
import { IntegrationParamsSchema } from '../../shared/integration-params.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';
import { SnapshotDataSchema } from './snapshot-data.schema';
import { User, UserDocument } from '../../user/schema/user.schema';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../../user/schema/integration-user.schema';
import { RealEstateListing } from '../../real-estate-listing/schema/real-estate-listing.schema';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';

interface ISearchResultSnapshotSchema extends IIframeTokens {
  config: ApiSearchResultSnapshotConfig;
  mapboxAccessToken: string; // seems to exist only for the iFrames, could be removed in the future
  snapshot: ApiSearchResultSnapshot;
  createdAt?: Date;
  description?: string;
  endsAt?: Date; // end date of the Pay per Use map
  externalId?: string;
  // TODO move to the 'integrationParams'
  iframeEndsAt?: Date; // expiration date for the integration iFrame
  integrationParams?: IApiIntegrationParams;
  integrationUser?: TIntegrationUserDocument;
  isTrial?: boolean;
  lastAccess?: Date;
  realEstate?: ApiRealEstateListing;
  realEstateId?: Types.ObjectId;
  updatedAt?: Date;
  user?: UserDocument;
  userId?: string;
  visitAmount?: number;
}

export type SearchResultSnapshotDocument = ISearchResultSnapshotSchema &
  Document;

export const SNAPSHOT_REAL_EST_PATH = 'realEstate';
export const SNAPSHOT_USER_PATH = 'user';
export const SNAPSHOT_INT_USER_PATH = 'integrationUser';

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class SearchResultSnapshot implements ISearchResultSnapshotSchema {
  @Prop({
    type: String,
    unique: true,
    sparse: true,
    validate: function (val: string): boolean {
      return !this.token && !!val;
    },
  })
  addressToken: string;

  @Prop({ type: Object, required: true })
  config: ApiSearchResultSnapshotConfig;

  @Prop({ type: String, required: true })
  mapboxAccessToken: string;

  @Prop({ type: SnapshotDataSchema, required: true })
  snapshot: ApiSearchResultSnapshot;

  @Prop({
    type: String,
    unique: true,
    sparse: true,
    validate: function (val: string): boolean {
      return !this.token && !!val;
    },
  })
  unaddressToken: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Date })
  endsAt?: Date;

  @Prop({ type: String })
  externalId?: string;

  @Prop({ type: Date })
  iframeEndsAt?: Date;

  @Prop({ type: IntegrationParamsSchema })
  integrationParams?: IApiIntegrationParams;

  @Prop({ type: Boolean })
  isTrial?: boolean;

  @Prop({ type: Date })
  lastAccess?: Date;

  @Prop({
    type: Types.ObjectId,
    set: (value: string | Types.ObjectId): Types.ObjectId =>
      typeof value === 'string' ? new Types.ObjectId(value) : value,
  })
  realEstateId?: Types.ObjectId;

  @Prop({
    type: String,
    index: true,
    validate: function (val: string): boolean {
      return !this.addressToken && !this.unaddressToken && !!val;
    },
  })
  token?: string;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: String })
  userId?: string;

  @Prop({ type: Number, default: 0 })
  visitAmount?: number;

  integrationUser?: TIntegrationUserDocument;
  realEstate?: ApiRealEstateListing;
  user?: UserDocument;
}

export const SearchResultSnapshotSchema: SchemaType<SearchResultSnapshotDocument> =
  SchemaFactory.createForClass(SearchResultSnapshot);

SearchResultSnapshotSchema.virtual(SNAPSHOT_USER_PATH, {
  ref: User.name,
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Multiple foreign fields
// https://github.com/Automattic/mongoose/issues/6608#issuecomment-723662319
SearchResultSnapshotSchema.virtual(SNAPSHOT_INT_USER_PATH, {
  ref: IntegrationUser.name,
  localField: 'integrationParams.integrationUserId',
  foreignField: 'integrationUserId',
  match: (doc: SearchResultSnapshotDocument) => ({
    integrationType: doc.integrationParams?.integrationType,
  }),
  justOne: true,
});

SearchResultSnapshotSchema.virtual(SNAPSHOT_REAL_EST_PATH, {
  ref: RealEstateListing.name,
  localField: 'realEstateId',
  foreignField: '_id',
  justOne: true,
});
