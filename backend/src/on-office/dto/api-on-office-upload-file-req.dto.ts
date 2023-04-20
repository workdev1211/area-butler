import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeUploadFileReq } from '@area-butler-types/on-office';

class ApiOnOfficeUploadFileReqDto implements IApiOnOfficeUploadFileReq {
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  base64Content: string;

  @IsNotEmpty()
  @IsString()
  fileTitle: string;
}

export default ApiOnOfficeUploadFileReqDto;
