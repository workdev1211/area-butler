import { ApiQuestionnaireRequest } from '@area-butler-types/potential-customer';

class ApiQuestionnaireRequestDto implements ApiQuestionnaireRequest {
  email: string;
  id: string;
  name: string;
  userInCopy: boolean;
}

export default ApiQuestionnaireRequestDto;
