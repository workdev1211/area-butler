import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
  ApiOnOfficeArtTypesEnum,
  IApiOnOfficeUploadFileReq,
} from '@area-butler-types/on-office';

class ApiOnOfficeUploadFileReqDto implements IApiOnOfficeUploadFileReq {
  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  base64Content?: string;

  @IsNotEmpty()
  @IsString()
  fileTitle: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsNotEmpty()
  @IsEnum(ApiOnOfficeArtTypesEnum)
  artType: ApiOnOfficeArtTypesEnum;

  // TODO check TS Exclude utility
  @IsOptional()
  @IsString()
  integrationId?: string;
}

export default ApiOnOfficeUploadFileReqDto;
