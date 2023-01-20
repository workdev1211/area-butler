export interface IApiOnOfficeUnlockProvider {
  token: string;
  secret: string;
  parameterCacheId: string;
  extendedClaim: string;
}

export interface IApiOnOfficeRenderData {
  providerData: string;
  scripts: Array<{ script: string }>;
}

interface IApiOnOfficeProviderParameters {
  parameterCacheId: string;
  extendedclaim: string;
  isRegularCustomer?: number;
}

export interface IApiOnOfficeProviderData {
  actionid: string;
  resourcetype: string;
  parameters: IApiOnOfficeProviderParameters;
}
