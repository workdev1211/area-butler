import { ApiUpsertQuestionnaire } from '@area-butler-types/potential-customer';
import { Body, Controller, Post } from '@nestjs/common';
import { PotentialCustomerService } from './potential-customer.service';

@Controller('api/potential-customers/questionnaire')
export class QuestionnaireController {
  constructor(private potentialCustomerService: PotentialCustomerService) {}

  @Post()
  public async insertQuestionnaire(
    @Body() questionnaireRequest: ApiUpsertQuestionnaire,
  ) {
    await this.potentialCustomerService.upsertCustomerFromQuestionnaire(
      questionnaireRequest,
    );
  }
}
