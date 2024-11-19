import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaType, SchemaTypes } from 'mongoose';

import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  IIframeTokens,
} from '@area-butler-types/types';
import { IntegrationParamsSchema } from '../../shared/integration-params.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';
import { SnapshotDataSchema } from './snapshot-data.schema';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../../user/schema/integration-user.schema';
import { RealEstateListing } from '../../real-estate-listing/schema/real-estate-listing.schema';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import {
  foreignIdGetSet,
  SNAPSHOT_INT_USER_PATH,
  SNAPSHOT_REAL_EST_PATH,
  SNAPSHOT_USER_PATH,
} from '../../shared/constants/schema';
import { User, UserDocument } from '../../user/schema/user.schema';

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
  realEstateId?: string;
  updatedAt?: Date;
  user?: UserDocument;
  userId?: string;
  visitAmount?: number;
}

export type SearchResultSnapshotDocument = ISearchResultSnapshotSchema &
  Document;

@Schema({
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class SearchResultSnapshot implements ISearchResultSnapshotSchema {
  @Prop({
    type: String,
    unique: true,
    sparse: true,
    validate: function (
      this: SearchResultSnapshotDocument,
      value: string,
    ): boolean {
      return !this.token && !!value;
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
    validate: function (
      this: SearchResultSnapshotDocument,
      value: string,
    ): boolean {
      return !this.token && !!value;
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
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  realEstateId?: string;

  @Prop({
    type: String,
    index: true,
    validate: function (
      this: SearchResultSnapshotDocument,
      value: string,
    ): boolean {
      return !this.addressToken && !this.unaddressToken && !!value;
    },
  })
  token?: string;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  userId?: string;

  @Prop({ type: Number, default: 0 })
  visitAmount?: number;

  integrationUser?: TIntegrationUserDocument;
  realEstate?: ApiRealEstateListing;
  user?: UserDocument;
}

export const SearchResultSnapshotSchema: SchemaType<SearchResultSnapshotDocument> =
  SchemaFactory.createForClass(SearchResultSnapshot) as SchemaType<SearchResultSnapshotDocument>;

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
