import { ApiFeatureTypesEnum } from '../types/external-api';

export const clientIdToUserId = {
  // Vova
  Ol1q6jlqWj0NG9yGDd1plsZu87fvTJWL: '62bdb038db1f498fd8a64a6b', // dev
  ukXatrFEnlAuwbMYWVV6nZIxCyGzuGC8: '627a39af101f21a3e681eafd', // prod
  // MyVivenda
  eukmomr0pSn9YkGIn2OEcNuiKMN6EQXC: '63b2a4c4e0afb5d60355531f', // MyVivenda Prod
};

export const apiRouteToFeatTypeMap: Record<string, ApiFeatureTypesEnum> = {
  '/api/location-ext/addresses-in-range':
    ApiFeatureTypesEnum.ADDRESSES_IN_RANGE,
  '/api/location-index-ext/query': ApiFeatureTypesEnum.LOCATION_INDICES,
  '/api/data-provision/overpass': ApiFeatureTypesEnum.TRIGGER_OVERPASS,
  '/api/location-ext/snapshot-data': ApiFeatureTypesEnum.SNAPSHOT_DATA,
  '/api/zensus-atlas-ext/query': ApiFeatureTypesEnum.ZENSUS_ATLAS,
  '/api/location-ext/poi-data': ApiFeatureTypesEnum.POI_DATA,
  '/api/open-ai-ext/query': ApiFeatureTypesEnum.OPEN_AI,
};
