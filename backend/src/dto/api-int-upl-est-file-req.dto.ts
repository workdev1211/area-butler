import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import {
  AreaButlerExportTypesEnum,
  TAreaButlerExportTypes,
} from '@area-butler-types/integration-user';
import { IApiIntUplEstFileReq } from '@area-butler-types/integration';
import { IsBase64Image } from '../shared/validation/is-base64-image.decorator';

@Exclude()
class ApiIntUplEstFileReqDto implements IApiIntUplEstFileReq {
  @Expose()
  @IsNotEmpty()
  @IsIn([
    ...Object.values(OpenAiQueryTypeEnum),
    ...Object.values(AreaButlerExportTypesEnum),
  ])
  exportType: TAreaButlerExportTypes;

  @Expose()
  @IsNotEmpty()
  @IsString()
  fileTitle: string;

  @Expose()
  @IsOptional()
  @IsBase64Image()
  base64Content?: string;

  @Expose()
  @IsOptional()
  @IsString()
  filename?: string;
}

export default ApiIntUplEstFileReqDto;
