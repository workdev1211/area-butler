import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { AreaButlerExportTypesEnum } from '@area-butler-types/integration-user';
import { IApiIntCreateEstateLinkReq } from '@area-butler-types/integration';

@Exclude()
class ApiIntCreateEstateLinkReqDto implements IApiIntCreateEstateLinkReq {
  @Expose()
  @IsNotEmpty()
  @IsIn([
    AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS,
    AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS,
  ])
  exportType:
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS;

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
