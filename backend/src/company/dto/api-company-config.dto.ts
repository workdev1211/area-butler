import { IsMongoId, IsOptional } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';

import { IApiCompanyConfig, ICompanyConfig } from '@area-butler-types/company';
import CompanyConfigDto from './company-config.dto';

@Exclude()
class ApiCompanyConfigDto
  extends OmitType(CompanyConfigDto, ['templateSnapshotId'])
  implements IApiCompanyConfig
{
  @Expose()
  @Transform(
    ({
      value,
      obj: { templateSnapshotId },
    }: {
      obj: ICompanyConfig;
      value: string;
    }): string => (value === null || value ? value : templateSnapshotId),
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsMongoId()
  companyTemplateSnapshotId?: string;
}

export default ApiCompanyConfigDto;
