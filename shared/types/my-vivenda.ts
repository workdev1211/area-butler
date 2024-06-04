import { ApiUser } from "./types";

export interface IApiMyVivendaLoginRes {
  user: ApiUser;
  snapshotId: string;
}

export interface IApiMyVivendaUplMapScreenReq {
  base64Image: string;
}
