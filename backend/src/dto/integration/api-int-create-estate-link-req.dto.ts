import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiIntCreateEstateLinkReq } from '@area-butler-types/integration';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';

@Exclude()
class ApiIntCreateEstateLinkReqDto implements IApiIntCreateEstateLinkReq {
  @Expose()
  @IsNotEmpty()
  @IsIn([AreaButlerExportTypesEnum.EMBEDDED_LINKS])
  exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS;

  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Expose()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}

export default ApiIntCreateEstateLinkReqDto;
