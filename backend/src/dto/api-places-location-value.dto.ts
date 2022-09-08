import { IsNotEmpty, IsString } from 'class-validator';

import { IApiPlacesLocationValue } from '@area-butler-types/types';

class ApiPlacesLocationValueDto implements IApiPlacesLocationValue {
  @IsNotEmpty()
  @IsString()
  place_id: string;
}

export default ApiPlacesLocationValueDto;
