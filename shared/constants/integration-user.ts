import { ApiShowTour, ApiTourNamesEnum } from "../types/types";

export const intUserInitShowTour: ApiShowTour = {
  [ApiTourNamesEnum.SEARCH]: false,
  [ApiTourNamesEnum.RESULT]: false,
  [ApiTourNamesEnum.REAL_ESTATES]: false,
  [ApiTourNamesEnum.CUSTOMERS]: false,
  [ApiTourNamesEnum.PROFILE]: false,
  [ApiTourNamesEnum.EDITOR]: false,
  [ApiTourNamesEnum.INT_MAP_MENU]: true,
};
