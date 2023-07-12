import { ApiFeatureTypesEnum } from './api.types';

export const apiRoutePathToFeatureTypeMapping: Record<
  string,
  ApiFeatureTypesEnum
> = {
  'addresses-in-range-ext': ApiFeatureTypesEnum.ADDRESSES_IN_RANGE,
  'location-index-ext': ApiFeatureTypesEnum.LOCATION_INDICES,
};
