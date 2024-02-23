import { ApiFeatureTypesEnum } from '../types/external-api';

// TODO REMOVE IN THE FUTURE
export const clientIdToUserId = {
  // Vova
  Ol1q6jlqWj0NG9yGDd1plsZu87fvTJWL: '62bdb038db1f498fd8a64a6b', // dev
  ukXatrFEnlAuwbMYWVV6nZIxCyGzuGC8: '627a39af101f21a3e681eafd', // prod
  // Alex
  '2FUmscAiwuDF8LGxHgS3o4dbXloSvykR': '6193bd021618a2e2e5a896c4', // prod
  // Immozy
  djIeoIFhTsu9lSrFiblMDDCs2mLaWPea: '631f33cdac5b195dd4cf9292', // prod
  // Philipp
  qKjhXvflvwQGPCcYecuTuCxUQqMZBSXp: '618ad8f53a757ec909e46a55', // dev
  QZUx6NvhzNYlGN2H1W2fKKQpTvCBuWKt: '6349239aa2840e9dc73512b3', // prod
  // MyVivenda
  // TODO limit access only to the reverse geocoding part
  eukmomr0pSn9YkGIn2OEcNuiKMN6EQXC: '63b2a4c4e0afb5d60355531f', // MyVivenda
};

export const apiRoutePathToFeatureTypeMapping: Record<
  string,
  ApiFeatureTypesEnum
> = {
  '/api/location-ext/addresses-in-range':
    ApiFeatureTypesEnum.ADDRESSES_IN_RANGE,
  '/api/location-index-ext/query': ApiFeatureTypesEnum.LOCATION_INDICES,
  '/api/location-ext/snapshot-data': ApiFeatureTypesEnum.SNAPSHOT_DATA,
  '/api/zensus-atlas-ext/query': ApiFeatureTypesEnum.ZENSUS_ATLAS,
  '/api/location-ext/poi-data': ApiFeatureTypesEnum.POI_DATA,
  '/api/open-ai-ext/query': ApiFeatureTypesEnum.OPEN_AI,
};

export const apiAllowedRoutes: string[] = [
  '/api/propstack-webhook/property-created',
];
