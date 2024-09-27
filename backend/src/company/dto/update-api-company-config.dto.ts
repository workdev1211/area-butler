import { Exclude } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

import { IApiCompanyConfig } from '@area-butler-types/company';
import ApiCompanyConfigDto from './api-company-config.dto';

@Exclude()
class UpdateApiCompanyConfigDto
  extends PartialType(ApiCompanyConfigDto)
  implements Partial<IApiCompanyConfig> {}

export default UpdateApiCompanyConfigDto;
