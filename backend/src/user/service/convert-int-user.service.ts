import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { TIntegrationUserDocument } from '../schema/integration-user.schema';
import { IApiIntegrationUser } from '@area-butler-types/integration-user';
import ApiIntegrationUserDto from '../dto/api-integration-user.dto';
import { ContingentIntService } from './contingent-int.service';
import ApiCompanyConfigDto from '../../company/dto/api-company-config.dto';

@Injectable()
export class ConvertIntUserService {
  constructor(private readonly contingentIntService: ContingentIntService) {}

  async convertDocToApiIntUser(
    integrationUser: TIntegrationUserDocument,
  ): Promise<IApiIntegrationUser> {
    const intUserObj = integrationUser.toObject() as TIntegrationUserDocument &
      IApiIntegrationUser;

    intUserObj.availProdContingents =
      await this.contingentIntService.getAvailProdContingents(integrationUser);

    if (intUserObj.company.config) {
      const companyConfigDto = plainToInstance(
        ApiCompanyConfigDto,
        intUserObj.company.config,
        { exposeUnsetFields: false },
      );

      intUserObj.config = {
        ...companyConfigDto,
        ...intUserObj.config,
      };
    }

    return plainToInstance(ApiIntegrationUserDto, intUserObj, {
      exposeUnsetFields: false,
    });
  }
}
