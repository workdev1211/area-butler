import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IsBase64Image } from '../shared/decorators/is-base64-image.decorator';
import {
  AreaButlerExportTypesEnum,
  IApiUploadFileReq,
} from '@area-butler-types/types';

@Exclude()
class ApiUploadFileReqDto implements IApiUploadFileReq {
  @Expose()
  @IsNotEmpty()
  @IsBase64Image()
  base64Image: string;

  @Expose()
  @IsNotEmpty()
  @IsIn([
    AreaButlerExportTypesEnum.QR_CODE,
    AreaButlerExportTypesEnum.SCREENSHOT,
    AreaButlerExportTypesEnum.ONE_PAGE_PNG,
  ])
  exportType:
    | AreaButlerExportTypesEnum.QR_CODE
    | AreaButlerExportTypesEnum.SCREENSHOT
    | AreaButlerExportTypesEnum.ONE_PAGE_PNG;

  @Expose()
  @IsOptional()
  @IsString()
  filename?: string;

  @Expose()
  @IsOptional()
  @IsString()
  fileTitle?: string;
}

export default ApiUploadFileReqDto;
