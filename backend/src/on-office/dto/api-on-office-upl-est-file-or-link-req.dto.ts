import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiOnOfficeUplEstFileOrLinkReq } from '@area-butler-types/on-office';
import ApiIntUplEstFileReqDto from '../../dto/api-int-upl-est-file-req.dto';
import {
  AreaButlerExportTypesEnum,
  TAreaButlerExportTypes,
} from '@area-butler-types/integration-user';

@Exclude()
class ApiOnOfficeUplEstFileOrLinkReqDto
  extends ApiIntUplEstFileReqDto
  implements IApiOnOfficeUplEstFileOrLinkReq
{
  @Expose()
  @IsNotEmpty()
  @IsIn([
    AreaButlerExportTypesEnum.QR_CODE,
    AreaButlerExportTypesEnum.SCREENSHOT,
    AreaButlerExportTypesEnum.ONE_PAGE_PNG,
    AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS,
    AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS,
  ])
  exportType: TAreaButlerExportTypes;

  @Expose()
  @IsOptional()
  @IsString()
  url?: string;
}

export default ApiOnOfficeUplEstFileOrLinkReqDto;
