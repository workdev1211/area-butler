import { FilterQuery, ProjectionFields, SortValues } from 'mongoose';

import { SearchResultSnapshotDocument } from '../../location/schema/search-result-snapshot.schema';

export type TApiMongoSortQuery = Record<string, SortValues>;

export interface IApiFetchSnapshotsReq {
  skip?: number;
  limit?: number;
  filter?: FilterQuery<SearchResultSnapshotDocument>;
  project?: ProjectionFields<SearchResultSnapshotDocument>;
  sort?: TApiMongoSortQuery;
}
export type TGeneralImage = {
  url: string;
  title: string;
  id?: string | number;
};
