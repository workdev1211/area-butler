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
import {
  ApiPotentialCustomer,
  ApiQuestionnaireRequest,
} from '@area-butler-types/potential-customer';

@ApiTags('potential-customers')
@Controller('api/potential-customers')
export class PotentialCustomerController extends AuthenticatedController {
  constructor(
    private readonly potentialCustomerService: PotentialCustomerService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Fetch potential customers' })
  @Get()
  async fetchPotentialCustomers(
    @InjectUser() user: UserDocument,
  ): Promise<ApiPotentialCustomer[]> {
    return (
      await this.potentialCustomerService.findMany(user)
    ).map((p) => mapPotentialCustomerToApiPotentialCustomer(p, user.id));
  }

  @ApiOperation({ description: 'Fetch potential customer names' })
  @Get('names')
  fetchNames(@InjectUser() user: UserDocument): Promise<string[]> {
    return this.potentialCustomerService.fetchNames(user);
  }

  @ApiOperation({ description: 'Create a potential customer' })
  @Post()
  async createPotentialCustomer(
    @InjectUser() user: UserDocument,
    @Body() potentialCustomer: ApiUpsertPotentialCustomerDto,
  ): Promise<ApiPotentialCustomer> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.createPotentialCustomer(
        user,
        potentialCustomer,
      ),
      user.id,
    );
  }

  @ApiOperation({ description: 'Add questionnaire' })
  @Post('/questionnaire-request')
  async insertQuestionnaireRequest(
    @InjectUser() user: UserDocument,
    @Body() questionnaireRequest: ApiUpsertQuestionnaireRequestDto,
  ): Promise<ApiQuestionnaireRequest> {
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
  ): Promise<ApiPotentialCustomer> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.updatePotentialCustomer(
        user,
        id,
        potentialCustomer,
      ),
      user.id,
    );
  }

  @ApiOperation({ description: 'Delete a potential customer' })
  @Delete(':id')
  deletePotentialCustomer(
    @Param('id') id: string,
    @InjectUser() user: UserDocument,
  ): void {
    void this.potentialCustomerService.deletePotentialCustomer(user, id);
  }
}
