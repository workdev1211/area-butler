import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { mapPotentialCustomerToApiPotentialCustomer } from './mapper/potential-customer.mapper';
import { PotentialCustomerService } from './potential-customer.service';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import ApiUpsertPotentialCustomerDto from '../dto/api-upsert-potential-customer.dto';
import { ApiPotentialCustomer } from '@area-butler-types/potential-customer';

@ApiTags('potential-customers', 'integration')
@Controller('api/potential-customers-int')
export class PotentialCustomerIntController {
  constructor(
    private readonly potentialCustomerService: PotentialCustomerService,
  ) {}

  @ApiOperation({ description: 'Create a potential customer' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post()
  async createPotentialCustomer(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() potentialCustomer: ApiUpsertPotentialCustomerDto,
  ): Promise<ApiPotentialCustomer> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.create(
        integrationUser,
        potentialCustomer,
      ),
    );
  }

  @ApiOperation({ description: 'Fetch potential customers' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get()
  async fetchPotentialCustomers(
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<ApiPotentialCustomer[]> {
    return (await this.potentialCustomerService.findMany(integrationUser)).map(
      (potentialCustomer) =>
        mapPotentialCustomerToApiPotentialCustomer(
          potentialCustomer,
          integrationUser.integrationUserId,
          true,
        ),
    );
  }

  @ApiOperation({ description: 'Fetch potential customer names' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('names')
  fetchNames(
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<string[]> {
    return this.potentialCustomerService.fetchNames(integrationUser);
  }

  @ApiOperation({ description: 'Update a potential customer' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put(':id')
  async updatePotentialCustomer(
    @Param('id') id: string,
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() potentialCustomer: Partial<ApiUpsertPotentialCustomerDto>,
  ): Promise<ApiPotentialCustomer> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.update(
        integrationUser,
        id,
        potentialCustomer,
      ),
    );
  }

  @ApiOperation({ description: 'Delete a potential customer' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Delete(':id')
  deletePotentialCustomer(
    @Param('id') id: string,
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<void> {
    return this.potentialCustomerService.delete(integrationUser, id);
  }
}
