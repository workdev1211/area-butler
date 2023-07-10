import { ApiFeatureTypesEnum } from './api.types';

export const apiRoutePathToFeatureTypeMapping: Record<
  string,
  ApiFeatureTypesEnum
> = {
  'addresses-in-range': ApiFeatureTypesEnum.ADDRESSES_IN_RANGE,
};
