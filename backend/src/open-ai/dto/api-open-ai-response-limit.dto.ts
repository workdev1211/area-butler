import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import {
  ApiOpenAiRespLimitTypesEnum,
  IApiOpenAiResponseLimit,
} from '@area-butler-types/open-ai';

// Left just in case of a future progress in OpenAi text limiting
class ApiOpenAiResponseLimitDto implements IApiOpenAiResponseLimit {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsEnum(ApiOpenAiRespLimitTypesEnum)
  type: ApiOpenAiRespLimitTypesEnum;
}

export default ApiOpenAiResponseLimitDto;
