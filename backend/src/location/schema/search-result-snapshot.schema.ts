import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
} from '@area-butler-types/types';
import { IntegrationParamsSchema } from '../../shared/integration-params.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';

export type SearchResultSnapshotDocument = SearchResultSnapshot & Document;

@Schema()
export class SearchResultSnapshot {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  token: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  mapboxAccessToken: string;

  @Prop({ type: Object })
  config: ApiSearchResultSnapshotConfig;

  @Prop({ type: Object })
  snapshot: ApiSearchResultSnapshot;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  lastAccess: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  endsAt: Date;

  @Prop({ type: Date })
  iframeEndsAt: Date;

  @Prop({ type: Number, default: 0 })
  visitAmount: number;

  @Prop({ type: IntegrationParamsSchema })
  integrationParams: IApiIntegrationParams;

  @Prop({ type: Boolean })
  isTrial: boolean;
}

export const SearchResultSnapshotSchema =
  SchemaFactory.createForClass(SearchResultSnapshot);
