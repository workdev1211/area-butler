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

export interface IApiOnOfficeRequest {
  token: string;
  request: { actions: IApiOnOfficeRequestAction[] };
}

interface IApiOnOfficeRequestAction {
  timestamp: number;
  hmac: string;
  hmac_version: 2;
  actionid: string; // enum
  resourceid: string;
  resourcetype: string; // enum
  parameters: IApiOnOfficeRequestActionParameters;
}

interface IApiOnOfficeRequestActionParameters {
  parameterCacheId: string;
  extendedclaim: string;
  isRegularCustomer?: number;
}

export interface IApiOnOfficeResponse {
  status: {
    code: number; // enum?
    errorcode: number; // enum?
    message: string; // enum?
  };
  response: {
    results: IApiOnOfficeResponseResult[];
  };
}

interface IApiOnOfficeResponseResult {
  actionid: string; // enum
  resourceid: string;
  resourcetype: string; // enum
  identifier: string;
  status: {
    code: number; // enum?
    message: string; // enum?
  };
  data: {
    records: IApiOnOfficeResponseResultRecord[];
  };
}

interface IApiOnOfficeResponseResultRecord {
  id: string;
  type: string;
  elements: Array<{ [key: string]: string }>;
}
