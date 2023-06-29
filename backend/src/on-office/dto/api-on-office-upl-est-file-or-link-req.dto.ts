import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IApiOnOfficeUplEstFileOrLinkReq } from '@area-butler-types/on-office';
import {
  AreaButlerExportTypesEnum,
  TAreaButlerExportTypes,
} from '@area-butler-types/integration-user';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';

class ApiOnOfficeUplEstFileOrLinkReqDto
  implements IApiOnOfficeUplEstFileOrLinkReq
{
  @IsNotEmpty()
  @IsIn([
    ...Object.values(OpenAiQueryTypeEnum),
    ...Object.values(AreaButlerExportTypesEnum),
  ])
  exportType: TAreaButlerExportTypes;

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

  // TODO check TS Exclude utility
  @IsOptional()
  @IsString()
  integrationId?: string;
}

export default ApiOnOfficeUplEstFileOrLinkReqDto;
