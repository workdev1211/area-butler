import { IsEnum, IsOptional } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import {
  ApiOnOfficeEstateMarketTypesEnum,
  ApiOnOfficeEstateStatusesEnum,
  IApiOnOfficeSyncEstatesFilterParams,
} from '@area-butler-types/on-office';

@Exclude()
class ApiOnOfficeSyncEstatesFilterParamsDto
  implements IApiOnOfficeSyncEstatesFilterParams
{
  @Expose({ name: 'status2' })
  @IsOptional()
  @Transform(
    ({ obj: { estateStatus } }: { obj: IApiOnOfficeSyncEstatesFilterParams }) =>
      estateStatus,
    { toClassOnly: true },
  )
  @IsEnum(ApiOnOfficeEstateStatusesEnum)
  estateStatus?: ApiOnOfficeEstateStatusesEnum;

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
  @IsEnum(ApiOnOfficeEstateMarketTypesEnum)
  estateMarketType?: ApiOnOfficeEstateMarketTypesEnum;
}

export default ApiOnOfficeSyncEstatesFilterParamsDto;
