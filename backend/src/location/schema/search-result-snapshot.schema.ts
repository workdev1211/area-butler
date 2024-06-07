import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaType } from 'mongoose';

import { ApiSearchResultSnapshotConfig } from '@area-butler-types/types';
import { IntegrationParamsSchema } from '../../shared/integration-params.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';
import {
  ISnapshotDataSchema,
  SnapshotDataSchema,
} from './snapshot-data.schema';

interface ISearchResultSnapshotSchema {
  config: ApiSearchResultSnapshotConfig;
  mapboxAccessToken: string; // seems to exist only for the iFrames, could be removed in the future
  snapshot: ISnapshotDataSchema;
  token: string;
  createdAt?: Date;
  description?: string;
  endsAt?: Date; // end date of the Pay per Use map
  externalId?: string;
  // TODO move to the 'integrationParams'
  iframeEndsAt?: Date; // expiration date for the integration iFrame
  integrationParams?: IApiIntegrationParams;
  isTrial?: boolean;
  lastAccess?: Date;
  updatedAt?: Date;
  userId?: string;
  visitAmount?: number;
}

export type SearchResultSnapshotDocument = ISearchResultSnapshotSchema &
  Document;

export const SNAPSHOT_REAL_EST_PATH = 'snapshot.realEstate';

@Schema()
export class SearchResultSnapshot implements ISearchResultSnapshotSchema {
  @Prop({ type: Object, required: true })
  config: ApiSearchResultSnapshotConfig;

  @Prop({ type: String, required: true })
  mapboxAccessToken: string;

  @Prop({ type: SnapshotDataSchema, required: true })
  snapshot: ISnapshotDataSchema;

  @Prop({ type: String, required: true })
  token: string;

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

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: String })
  userId?: string;

  @Prop({ type: Number, default: 0 })
  visitAmount?: number;
}

export const SearchResultSnapshotSchema: SchemaType<SearchResultSnapshotDocument> =
  SchemaFactory.createForClass(SearchResultSnapshot);
