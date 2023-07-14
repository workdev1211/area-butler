import { ApiFeatureTypesEnum } from './api.types';

export const apiRoutePathToFeatureTypeMapping: Record<
  string,
  ApiFeatureTypesEnum
> = {
  'addresses-in-range': ApiFeatureTypesEnum.ADDRESSES_IN_RANGE,
  'location-index-ext': ApiFeatureTypesEnum.LOCATION_INDICES,
  'poi-data': ApiFeatureTypesEnum.POI_DATA,
};
