import { IsNotEmpty, IsString } from 'class-validator';

import { ISelectTextValue } from '@area-butler-types/types';

class ApiSelectTextValueDto implements ISelectTextValue {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

export default ApiSelectTextValueDto;
