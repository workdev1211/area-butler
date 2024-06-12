import { ApiUser } from "./types";

export interface IMyVivendaLoginQueryParams {
  accessToken: string;
}

export interface IApiMyVivendaLoginRes {
  user: ApiUser;
  snapshotId: string;
}
