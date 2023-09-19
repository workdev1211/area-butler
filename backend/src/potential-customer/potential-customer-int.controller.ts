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

import ApiPotentialCustomerDto from '../dto/api-potential-customer.dto';
import { InjectUser } from '../user/inject-user.decorator';
import { mapPotentialCustomerToApiPotentialCustomer } from './mapper/potential-customer.mapper';
import { PotentialCustomerService } from './potential-customer.service';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import ApiUpsertPotentialCustomerDto from '../dto/api-upsert-potential-customer.dto';

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
  ): Promise<ApiPotentialCustomerDto> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.createPotentialCustomer(
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
  ): Promise<ApiPotentialCustomerDto[]> {
    return (
      await this.potentialCustomerService.fetchPotentialCustomers(
        integrationUser,
      )
    ).map((potentialCustomer) =>
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
  async fetchNames(
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
  ): Promise<ApiPotentialCustomerDto> {
    return mapPotentialCustomerToApiPotentialCustomer(
      await this.potentialCustomerService.updatePotentialCustomer(
        integrationUser,
        id,
        potentialCustomer,
      ),
    );
  }

  @ApiOperation({ description: 'Delete a potential customer' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Delete(':id')
  async deletePotentialCustomer(
    @Param('id') id: string,
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ) {
    await this.potentialCustomerService.deletePotentialCustomer(
      integrationUser,
      id,
    );
  }
}
