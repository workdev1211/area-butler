import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import {
  ApiOpenAiResponseLimitTypesEnum,
  IApiOpenAiResponseLimit,
} from '@area-butler-types/open-ai';

class ApiOpenAiResponseLimitDto implements IApiOpenAiResponseLimit {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsEnum(ApiOpenAiResponseLimitTypesEnum)
  type: ApiOpenAiResponseLimitTypesEnum;
}

export default ApiOpenAiResponseLimitDto;
