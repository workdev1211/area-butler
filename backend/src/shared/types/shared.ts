import { Document, FilterQuery, ProjectionFields, SortValues } from 'mongoose';

import { IApiFetchReqParams } from '@area-butler-types/types';

export type TApiMongoSortQuery = Record<string, SortValues>;

export type TFetchReqParams<T extends Document> = IApiFetchReqParams<
  FilterQuery<T>,
  ProjectionFields<T>,
  TApiMongoSortQuery
>;

export type TGeneralImage = {
  title: string;
  url: string;
  id?: string | number;
};
