import { IntegrationTypesEnum } from "../types/integration";

export const wrongIntegrationErrorMsg = "Diese Integration ist nicht korrekt.";

export const integrationNames: Record<IntegrationTypesEnum, string> = {
  [IntegrationTypesEnum.MY_VIVENDA]: "MyVivenda",
  [IntegrationTypesEnum.ON_OFFICE]: "onOffice",
  [IntegrationTypesEnum.PROPSTACK]: "Propstack",
};
