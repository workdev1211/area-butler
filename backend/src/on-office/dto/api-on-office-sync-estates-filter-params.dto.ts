import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import { IApiSyncEstatesIntFilterParams } from '@area-butler-types/integration';
import { IApiOnOfficeSyncEstatesFilterParams } from '@area-butler-types/on-office';

@Exclude()
class ApiOnOfficeSyncEstatesFilterParamsDto
  implements IApiOnOfficeSyncEstatesFilterParams
{
  @Expose()
  @IsOptional()
  @Transform(
    ({ obj: { estateStatus } }: { obj: IApiSyncEstatesIntFilterParams }) =>
      estateStatus,
    { toClassOnly: true },
  )
  @IsString()
  status2?: string;

  @Expose()
  @IsOptional()
  @Transform(
    ({ obj: { estateMarketType } }: { obj: IApiSyncEstatesIntFilterParams }) =>
      estateMarketType,
    { toClassOnly: true },
  )
  @IsString()
  vermarktungsart?: string;
}

export default ApiOnOfficeSyncEstatesFilterParamsDto;
