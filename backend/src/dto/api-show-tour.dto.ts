import { IsBoolean, IsNotEmpty } from 'class-validator';

import { ApiShowTour, ApiTourNamesEnum } from '@area-butler-types/types';

class ApiShowTourDto implements ApiShowTour {
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.CUSTOMERS]: boolean;

  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.EDITOR]: boolean;

  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.PROFILE]: boolean;

  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.REAL_ESTATES]: boolean;

  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.RESULT]: boolean;

  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.SEARCH]: boolean;

  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.INT_MAP_MENU]: boolean;
}

export default ApiShowTourDto;
