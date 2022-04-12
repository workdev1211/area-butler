import { ApiUpsertQuestionnaireRequest } from '@area-butler-types/potential-customer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

class ApiUpsertQuestionnaireRequestDto
  implements ApiUpsertQuestionnaireRequest
{
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  userInCopy: boolean;
}

export default ApiUpsertQuestionnaireRequestDto;
