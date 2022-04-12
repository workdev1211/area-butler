import { RollbarConfig } from '@area-butler-types/types';
import { IsNotEmpty } from 'class-validator';

class RollbarConfigDto implements RollbarConfig {

  @IsNotEmpty()
  accessToken: string;

  @IsNotEmpty()
  code_version: string;

  @IsNotEmpty()
  environment: string;
}

export default RollbarConfigDto;
