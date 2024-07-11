import {
  ArrayMinSize,
  ArrayMaxSize,
  Equals,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  IApiIntPublicLinkParams,
  IApiIntSetPropPubLinksReq,
} from '@area-butler-types/integration';
import ApiIntPublicLinkParamsDto from './api-int-public-link-params.dto';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';

@Exclude()
class ApiIntSetPropPubLinksReqDto implements IApiIntSetPropPubLinksReq {
  @Expose()
  @IsNotEmpty()
  @Equals(AreaButlerExportTypesEnum.EMBEDDED_LINKS)
  exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS;

  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @Type(() => ApiIntPublicLinkParamsDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  publicLinkParams: IApiIntPublicLinkParams[];
}

export default ApiIntSetPropPubLinksReqDto;
