import { ApiShowTour, ApiTourNamesEnum } from "../types/types";
import { IntegrationTypesEnum } from "../types/integration";

export const intUserInitShowTour: ApiShowTour = {
  [ApiTourNamesEnum.SEARCH]: false,
  [ApiTourNamesEnum.RESULT]: false,
  [ApiTourNamesEnum.REAL_ESTATES]: false,
  [ApiTourNamesEnum.CUSTOMERS]: true,
  [ApiTourNamesEnum.PROFILE]: false,
  [ApiTourNamesEnum.EDITOR]: false,
  [ApiTourNamesEnum.INT_MAP]: true,
  [ApiTourNamesEnum.INT_SEARCH]: true,
};

export const wrongIntegrationErrorMsg = "Diese Integration ist nicht korrekt.";

export const integrationNames: Record<IntegrationTypesEnum, string> = {
  [IntegrationTypesEnum.ON_OFFICE]: "onOffice",
  [IntegrationTypesEnum.PROPSTACK]: "Propstack",
};
