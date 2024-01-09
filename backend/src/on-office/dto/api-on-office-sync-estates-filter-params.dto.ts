import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import { IApiOnOfficeSyncEstatesFilterParams } from '@area-butler-types/on-office';

@Exclude()
class ApiOnOfficeSyncEstatesFilterParamsDto
  implements IApiOnOfficeSyncEstatesFilterParams
{
  // 'Expose' with 'Transform' are both required to rename the params
  @Expose({ name: 'status2' })
  @IsOptional()
  @Transform(
    ({ obj: { estateStatus } }: { obj: IApiOnOfficeSyncEstatesFilterParams }) =>
      estateStatus,
    { toClassOnly: true },
  )
  @IsString()
  estateStatus?: string;

  @Expose({ name: 'vermarktungsart' })
  @IsOptional()
  @Transform(
    ({
      obj: { estateMarketType },
    }: {
      obj: IApiOnOfficeSyncEstatesFilterParams;
    }) => estateMarketType,
    { toClassOnly: true },
  )
  @IsString()
  estateMarketType?: string;
}

export default ApiOnOfficeSyncEstatesFilterParamsDto;
