import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiIntPublicLinkParams } from '@area-butler-types/integration';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';

@Exclude()
class ApiIntPublicLinkParamsDto implements IApiIntPublicLinkParams {
  @Expose()
  @IsNotEmpty()
  @IsIn([
    AreaButlerExportTypesEnum.LINK_WITH_ADDRESS,
    AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
  ])
  exportType:
    | AreaButlerExportTypesEnum.LINK_WITH_ADDRESS
    | AreaButlerExportTypesEnum.LINK_WO_ADDRESS;

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
