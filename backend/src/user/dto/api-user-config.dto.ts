import { Exclude } from 'class-transformer';
import { IntersectionType, OmitType } from '@nestjs/swagger';

import UserConfigDto from './user-config.dto';
import { IApiUserConfig } from '@area-butler-types/user';
import ApiCompanyConfigDto from '../../company/dto/api-company-config.dto';

@Exclude()
class ApiUserConfigDto
  extends IntersectionType(
    UserConfigDto,
    OmitType(ApiCompanyConfigDto, ['templateSnapshotId']),
  )
  implements IApiUserConfig {}

export default ApiUserConfigDto;
