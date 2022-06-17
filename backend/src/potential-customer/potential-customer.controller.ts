import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import ApiPotentialCustomerDto from '../dto/api-potential-customer.dto';
import ApiQuestionnaireRequestDto from '../dto/api-questionnaire-request.dto';
import ApiUpsertPotentialCustomerDto from '../dto/api-upsert-potential-customer.dto';
import ApiUpsertQuestionnaireRequestDto from '../dto/api-upsert-questionnaire-request.dto';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import {
  mapPotentialCustomerToApiPotentialCustomer,
  mapQuestionnaireRequestToApiQuestionnaireRequest,
} from './mapper/potential-customer.mapper';
import { PotentialCustomerService } from './potential-customer.service';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';

@ApiTags('potential-customers')
@Controller('api/potential-customers')
export class PotentialCustomerController extends AuthenticatedController {
  constructor(private potentialCustomerService: PotentialCustomerService) {
    super();
  }

  @ApiOperation({ description: 'Fetch potential customers' })
  @Get()
  async fetchPotentialCustomers(
    @InjectUser() user: UserDocument,
  ): Promise<ApiPotentialCustomerDto[]> {
    return (
      await this.potentialCustomerService.fetchPotentialCustomers(user)
    ).map((p) => mapPotentialCustomerToApiPotentialCustomer(p));
  }

  @ApiOperation({ description: 'Add potential customers' })
  @Post()
  async insertPotentialCustomer(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() potentialCustomer: ApiUpsertPotentialCustomerDto,
  ): Promise<ApiPotentialCustomerDto> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.insertPotentialCustomer(
        user,
        potentialCustomer,
      ),
    );
  }

  @ApiOperation({ description: 'Add questionnaire' })
  @Post('/questionnaire-request')
  async insertQuestionnaireRequest(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() questionnaireRequest: ApiUpsertQuestionnaireRequestDto,
  ): Promise<ApiQuestionnaireRequestDto> {
    return mapQuestionnaireRequestToApiQuestionnaireRequest(
      await this.potentialCustomerService.insertQuestionnaireRequest(
        user,
        questionnaireRequest,
      ),
    );
  }

  @ApiOperation({ description: 'Update a potential customer' })
  @Put(':id')
  async updatePotentialCustomer(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
    @Body() potentialCustomer: Partial<ApiUpsertPotentialCustomerDto>,
  ): Promise<ApiPotentialCustomerDto> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.updatePotentialCustomer(
        user,
        id,
        potentialCustomer,
      ),
    );
  }

  @ApiOperation({ description: 'Delete a potential customer' })
  @Delete(':id')
  async deletePotentialCustomer(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
  ) {
    await this.potentialCustomerService.deletePotentialCustomer(user, id);
  }
}
