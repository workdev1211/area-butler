import { ApiShowTour } from '@area-butler-types/types';
import { IsBoolean, IsNotEmpty } from 'class-validator';

class ApiShowTourDto implements ApiShowTour {

  @IsBoolean()
  @IsNotEmpty()
  customers: boolean;

  @IsBoolean()
  @IsNotEmpty()
  editor: boolean;

  @IsBoolean()
  @IsNotEmpty()
  profile: boolean;

  @IsBoolean()
  @IsNotEmpty()
  realEstates: boolean;

  @IsBoolean()
  @IsNotEmpty()
  result: boolean;

  @IsBoolean()
  @IsNotEmpty()
  search: boolean;
}

export default ApiShowTourDto;
