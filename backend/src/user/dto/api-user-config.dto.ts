import { Exclude, Expose } from 'class-transformer';
import { IntersectionType, OmitType } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

import UserConfigDto from './user-config.dto';
import { IApiUserConfig } from '@area-butler-types/user';
import ApiCompanyConfigDto from '../../company/dto/api-company-config.dto';

@Exclude()
class ApiUserConfigDto
  extends IntersectionType(
    UserConfigDto,
    OmitType(ApiCompanyConfigDto, ['companyTemplateSnapshotId']),
  )
  implements IApiUserConfig
{
  @Expose()
  @IsOptional()
  @IsMongoId()
  companyTemplateSnapshotId?: string;
}

export default ApiUserConfigDto;
