import { ApiFeatureTypesEnum } from './api.types';

export const apiRoutePathToFeatureTypeMapping: Record<
  string,
  ApiFeatureTypesEnum
> = {
  'api-addresses-in-range': ApiFeatureTypesEnum.ADDRESSES_IN_RANGE,
  'api-location-index': ApiFeatureTypesEnum.LOCATION_INDICES,
};
