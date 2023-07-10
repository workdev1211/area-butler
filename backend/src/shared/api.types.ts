export enum ApiFeatureTypesEnum {
  ADDRESSES_IN_RANGE = 'ADDRESSES_IN_RANGE',
}

export interface IApiKeyParams {
  apiKey: string;
  allowedFeatures: ApiFeatureTypesEnum[];
}
