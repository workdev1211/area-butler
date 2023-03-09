import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OnOfficeService } from './on-office.service';
import { IntegrationTypesEnum } from '@area-butler-types/types';
import { OnOfficeController } from './on-office.controller';

// TODO change api/on-office to api/on-office-shop
@ApiTags('OnOffice')
@Controller('api/on-office')
export class OnOfficeShopController extends OnOfficeController {
  constructor(protected readonly onOfficeService: OnOfficeService) {
    super(onOfficeService, IntegrationTypesEnum.ON_OFFICE_SHOP);
  }
}
