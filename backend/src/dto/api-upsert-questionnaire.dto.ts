import { ApiUpsertQuestionnaire } from '@area-butler-types/potential-customer';
import ApiUpsertPotentialCustomerDto from './api-upsert-potential-customer.dto';

class ApiUpsertQuestionnaireDto implements ApiUpsertQuestionnaire {
  customer: ApiUpsertPotentialCustomerDto;
  token: string;
}

export default ApiUpsertQuestionnaireDto;
