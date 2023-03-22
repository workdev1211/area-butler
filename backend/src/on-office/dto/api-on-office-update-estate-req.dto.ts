import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeUpdateEstateReq } from '@area-butler-types/on-office';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';

class ApiOnOfficeUpdateEstateReqDto implements IApiOnOfficeUpdateEstateReq {
  @IsNotEmpty()
  @IsEnum(OpenAiQueryTypeEnum)
  queryType: OpenAiQueryTypeEnum;

  @IsNotEmpty()
  @IsString()
  queryResponse: string;
}

export default ApiOnOfficeUpdateEstateReqDto;
