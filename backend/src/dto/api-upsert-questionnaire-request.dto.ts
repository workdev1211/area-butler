import { ApiUpsertQuestionnaireRequest } from '@area-butler-types/potential-customer';

class ApiUpsertQuestionnaireRequestDto
  implements ApiUpsertQuestionnaireRequest
{
  email: string;
  name: string;
  userInCopy: boolean;
}

export default ApiUpsertQuestionnaireRequestDto;
