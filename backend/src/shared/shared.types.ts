import { Types } from 'mongoose';

export interface IApiMongoProjectSortParams {
  [key: string]: number;
}

export interface IApiMongoFilterParams {
  [key: string]: string | Types.ObjectId;
}

export interface IApiFetchSnapshotsReq {
  skip?: number;
  limit?: number;
  filter?: IApiMongoFilterParams;
  project?: IApiMongoProjectSortParams;
  sort?: IApiMongoProjectSortParams;
}
