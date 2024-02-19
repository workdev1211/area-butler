import { IsIn, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiPropstackUplPropImgReq } from '@area-butler-types/propstack';
import ApiIntUplEstFileReqDto from '../../dto/api-int-upl-est-file-req.dto';
import {
  AreaButlerExportTypesEnum,
  TAreaButlerExportTypes,
} from '@area-butler-types/integration-user';
import { IsBase64Image } from '../../shared/validation/is-base64-image.decorator';

@Exclude()
class ApiPropstackUplPropImgReqDto
  extends ApiIntUplEstFileReqDto
  implements IApiPropstackUplPropImgReq
{
  @Expose()
  @IsNotEmpty()
  @IsBase64Image()
  base64Content: string;

  @Expose()
  @IsNotEmpty()
  @IsIn([
    AreaButlerExportTypesEnum.QR_CODE,
    AreaButlerExportTypesEnum.ONE_PAGE_PNG,
    AreaButlerExportTypesEnum.SCREENSHOT,
  ])
  exportType: TAreaButlerExportTypes;
}

export default ApiPropstackUplPropImgReqDto;
