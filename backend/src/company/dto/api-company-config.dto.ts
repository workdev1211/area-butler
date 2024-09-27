import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import { IApiCompanyConfig } from '@area-butler-types/company';
import CompanyConfigDto from './company-config.dto';

@Exclude()
class ApiCompanyConfigDto
  extends CompanyConfigDto
  implements IApiCompanyConfig
{
  @Expose()
  @Transform(
    ({
      value,
      obj: { templateSnapshotId },
    }: {
      obj: IApiCompanyConfig;
      value: string;
    }): string => value || templateSnapshotId,
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsString()
  companyTemplateSnapshotId?: string;

  @Expose()
  @Transform(
    ({
      value,
      obj: { companyTemplateSnapshotId },
    }: {
      obj: IApiCompanyConfig;
      value: string;
    }): string => companyTemplateSnapshotId || value,
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default ApiCompanyConfigDto;
