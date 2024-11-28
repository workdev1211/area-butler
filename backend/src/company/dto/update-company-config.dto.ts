import { Exclude, Expose, Transform } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

import { IApiCompanyConfig, ICompanyConfig } from '@area-butler-types/company';
import CompanyConfigDto from './company-config.dto';

@Exclude()
class UpdateCompanyConfigDto
  extends OmitType(CompanyConfigDto, ['templateSnapshotId'])
  implements ICompanyConfig
{
  @Expose()
  @Transform(
    ({
      obj: { companyTemplateSnapshotId },
    }: {
      obj: IApiCompanyConfig;
    }): string => companyTemplateSnapshotId,
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsMongoId()
  templateSnapshotId?: string;
}

export default UpdateCompanyConfigDto;
