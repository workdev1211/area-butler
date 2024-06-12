import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiIntUploadEstateFileReq } from '@area-butler-types/integration';
import ApiUploadFileReqDto from '../api-upload-file-req.dto';

@Exclude()
class ApiIntUploadEstateFileReqDto
  extends ApiUploadFileReqDto
  implements IApiIntUploadEstateFileReq
{
  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @IsOptional()
  @IsString()
  fileTitle = 'Lageplan';
}

export default ApiIntUploadEstateFileReqDto;
