import { ApiFeatureTypesEnum } from './api.types';

export const apiRoutePathToFeatureTypeMapping: Record<
  string,
  ApiFeatureTypesEnum
> = {
  '/api/location-ext/addresses-in-range':
    ApiFeatureTypesEnum.ADDRESSES_IN_RANGE,
  '/api/location-ext/poi-data': ApiFeatureTypesEnum.POI_DATA,
  '/api/location-index-ext': ApiFeatureTypesEnum.LOCATION_INDICES,
};
