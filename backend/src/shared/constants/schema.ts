import { Types } from 'mongoose';

export const foreignIdGetSet = {
  get: (objectId: Types.ObjectId): string | undefined => objectId?.toString(),
  set: (stringId: string): Types.ObjectId | undefined =>
    stringId ? new Types.ObjectId(stringId) : undefined,
};

export const COMPANY_PATH = 'company';
export const PARENT_USER_PATH = 'parentUser';
export const SNAPSHOT_REAL_EST_PATH = 'realEstate';
export const SNAPSHOT_USER_PATH = 'user';
export const SNAPSHOT_INT_USER_PATH = 'integrationUser';
// export const TEMPLATE_SNAPSHOT_PATH = 'parentUser'; // TODO currently buggy
