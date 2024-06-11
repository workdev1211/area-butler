import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IsBase64Image } from '../../shared/decorators/is-base64-image.decorator';
import { IApiIntUploadEstateFileReq } from '@area-butler-types/integration';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';

@Exclude()
class ApiIntUploadEstateFileReqDto implements IApiIntUploadEstateFileReq {
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
  @IsNotEmpty()
  @IsString()
  fileTitle: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @IsOptional()
  @IsString()
  filename?: string;
}

export default ApiIntUploadEstateFileReqDto;
