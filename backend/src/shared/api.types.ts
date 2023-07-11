export enum ApiFeatureTypesEnum {
  ADDRESSES_IN_RANGE = 'ADDRESSES_IN_RANGE',
  LOCATION_INDICES = 'LOCATION_INDICES',
}

export interface IApiKeyParams {
  apiKey: string;
  allowedFeatures: ApiFeatureTypesEnum[];
}
