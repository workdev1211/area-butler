import { Types } from 'mongoose';

export const foreignIdGetSet = {
  get: (objectId: Types.ObjectId): string | undefined => objectId?.toString(),
  set: (stringId: string): Types.ObjectId | undefined =>
    stringId ? new Types.ObjectId(stringId) : undefined,
};
