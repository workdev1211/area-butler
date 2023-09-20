import { IsNotEmpty, IsString } from 'class-validator';

import { IApiMapboxStyle } from '@area-butler-types/types';

class ApiMapboxStyleDto implements IApiMapboxStyle {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  label: string;
}

export default ApiMapboxStyleDto;
