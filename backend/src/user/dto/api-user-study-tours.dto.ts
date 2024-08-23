import { IsBoolean, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ApiTourNamesEnum, TApiUserStudyTours } from '@area-butler-types/types';

@Exclude()
class ApiUserStudyToursDto implements TApiUserStudyTours {
  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.CUSTOMERS]: boolean;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.EDITOR]: boolean;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.INT_MAP]: boolean;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.INT_SEARCH]: boolean;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.PROFILE]: boolean;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.RESULT]: boolean;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.REAL_ESTATES]: boolean;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  [ApiTourNamesEnum.SEARCH]: boolean;
}

export default ApiUserStudyToursDto;
