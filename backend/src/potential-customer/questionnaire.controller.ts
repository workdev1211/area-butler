import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PotentialCustomerService } from './potential-customer.service';
import ApiUpsertQuestionnaireDto from '../dto/api-upsert-questionnaire.dto';

@ApiTags('questionnaire')
@Controller('api/potential-customers/questionnaire')
export class QuestionnaireController {
  constructor(private potentialCustomerService: PotentialCustomerService) {}

  @ApiOperation({ description: 'Add a new questionnaire' })
  @Post()
  async insertQuestionnaire(
    @Body() questionnaireRequest: ApiUpsertQuestionnaireDto,
  ) {
    try {
      await this.potentialCustomerService.upsertFromQuestionnaire(
        questionnaireRequest,
      );
    } catch (err) {
      console.error('Error while storing questionnaire data', err);
      throw err;
    }
  }
}
