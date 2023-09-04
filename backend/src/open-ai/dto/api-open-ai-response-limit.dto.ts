import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import {
  ApiOpenAiRespLimitTypesEnum,
  IApiOpenAiResponseLimit,
} from '@area-butler-types/open-ai';

class ApiOpenAiResponseLimitDto implements IApiOpenAiResponseLimit {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsEnum(ApiOpenAiRespLimitTypesEnum)
  type: ApiOpenAiRespLimitTypesEnum;
}

export default ApiOpenAiResponseLimitDto;
