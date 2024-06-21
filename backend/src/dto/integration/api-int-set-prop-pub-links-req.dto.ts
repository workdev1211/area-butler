import {
  ArrayNotEmpty,
  Equals,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import { AreaButlerExportTypesEnum } from '@area-butler-types/integration-user';
import {
  IApiIntPublicLinkParams,
  IApiIntSetPropPubLinksReq,
} from '@area-butler-types/integration';
import ApiIntPublicLinkParamsDto from './api-int-public-link-params.dto';

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
  @ArrayNotEmpty()
  @MaxLength(2, {
    each: true,
  })
  @ValidateNested({ each: true })
  publicLinkParams: IApiIntPublicLinkParams[];
}

export default ApiIntSetPropPubLinksReqDto;
