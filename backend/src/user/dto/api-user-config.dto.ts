import { Exclude } from 'class-transformer';
import { IntersectionType, PartialType } from '@nestjs/swagger';

import CompanyConfigDto from '../../company/dto/company-config.dto';
import UserConfigDto from './user-config.dto';
import { IApiUserConfig } from '@area-butler-types/user';

@Exclude()
class ApiUserConfigDto
  extends IntersectionType(PartialType(UserConfigDto), CompanyConfigDto)
  implements Partial<IApiUserConfig> {}

export default ApiUserConfigDto;
