import {
  ApiPotentialCustomer,
  ApiQuestionnaireRequest,
  ApiUpsertPotentialCustomer,
  ApiUpsertQuestionnaireRequest,
} from '@area-butler-types/potential-customer';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import {
  mapPotentialCustomerToApiPotentialCustomer,
  mapQuestionnaireRequestToApiQuestionnaireRequest,
} from './mapper/potential-customer.mapper';
import { PotentialCustomerService } from './potential-customer.service';

@Controller('api/potential-customers')
export class PotentialCustomerController extends AuthenticatedController {
  constructor(private potentialCustomerService: PotentialCustomerService) {
    super();
  }

  @Get()
  async fetchPotentialCustomers(
    @InjectUser() user: UserDocument,
  ): Promise<ApiPotentialCustomer[]> {
    return (
      await this.potentialCustomerService.fetchPotentialCustomers(user)
    ).map((p) => mapPotentialCustomerToApiPotentialCustomer(p));
  }

  @Post()
  public async insertPotentialCustomer(
    @InjectUser() user: UserDocument,
    @Body() potentialCustomer: ApiUpsertPotentialCustomer,
  ): Promise<ApiPotentialCustomer> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.insertPotentialCustomer(
        user,
        potentialCustomer,
      ),
    );
  }

  @Post('/questionnaire-request')
  public async insertQuestionnaireRequest(
    @InjectUser() user: UserDocument,
    @Body() questionnaireRequest: ApiUpsertQuestionnaireRequest,
  ): Promise<ApiQuestionnaireRequest> {
    return mapQuestionnaireRequestToApiQuestionnaireRequest(
      await this.potentialCustomerService.insertQuestionnaireRequest(
        user,
        questionnaireRequest,
      ),
    );
  }

  @Put(':id')
  public async updatePotentialCustomer(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
    @Body() potentialCustomer: Partial<ApiUpsertPotentialCustomer>,
  ): Promise<ApiPotentialCustomer> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.updatePotentialCustomer(
        user,
        id,
        potentialCustomer,
      ),
    );
  }

  @Delete(':id')
  public async deletePotentialCustomer(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
  ) {
    await this.potentialCustomerService.deletePotentialCustomer(user, id);
  }
}
