import { ApiUpsertQuestionnaire } from '@area-butler-types/potential-customer';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import ApiUpsertPotentialCustomerDto from './api-upsert-potential-customer.dto';

class ApiUpsertQuestionnaireDto implements ApiUpsertQuestionnaire {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiUpsertPotentialCustomerDto)
  customer: ApiUpsertPotentialCustomerDto;

  @IsNotEmpty()
  token: string;
}

export default ApiUpsertQuestionnaireDto;
