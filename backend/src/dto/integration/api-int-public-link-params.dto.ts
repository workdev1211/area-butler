import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiIntPublicLinkParams } from '@area-butler-types/integration';

@Exclude()
class ApiIntPublicLinkParamsDto implements IApiIntPublicLinkParams {
  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  isAddressShown: boolean;

  @Expose()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isLinkEntity?: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  title?: string;
}

export default ApiIntPublicLinkParamsDto;
