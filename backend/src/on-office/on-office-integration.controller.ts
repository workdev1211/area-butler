import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OnOfficeController } from './on-office.controller';
import { OnOfficeService } from './on-office.service';
import { IntegrationTypesEnum } from '@area-butler-types/types';

@ApiTags('OnOffice')
@Controller('api/on-office-integration')
export class OnOfficeIntegrationController extends OnOfficeController {
  constructor(protected readonly onOfficeService: OnOfficeService) {
    super(onOfficeService, IntegrationTypesEnum.ON_OFFICE_INTEGRATION);
  }
}
