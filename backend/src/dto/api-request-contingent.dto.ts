import {
  ApiRequestContingent,
  ApiRequestContingentType
} from '@area-butler-types/subscription-plan';
import { IsDate, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

class ApiRequestContingentDto implements ApiRequestContingent {

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsEnum(ApiRequestContingentType)
  type: ApiRequestContingentType;
}

export default ApiRequestContingentDto;
