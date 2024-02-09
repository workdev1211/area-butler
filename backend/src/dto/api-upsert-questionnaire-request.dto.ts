import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ApiUpsertQuestionnaireRequest } from '@area-butler-types/potential-customer';

@Exclude()
class ApiUpsertQuestionnaireRequestDto
  implements ApiUpsertQuestionnaireRequest
{
  @Expose()
  @IsNotEmpty()
  @IsString()
  email: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  userInCopy: boolean;
}

export default ApiUpsertQuestionnaireRequestDto;
