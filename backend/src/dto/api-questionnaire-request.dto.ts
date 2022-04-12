import { ApiQuestionnaireRequest } from '@area-butler-types/potential-customer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

class ApiQuestionnaireRequestDto implements ApiQuestionnaireRequest {

  @IsNotEmpty()
  email: string;
  
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;
  
  @IsNotEmpty()
  @IsBoolean()
  userInCopy: boolean;
}

export default ApiQuestionnaireRequestDto;
