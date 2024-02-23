import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import { IApiSyncEstatesIntFilterParams } from '@area-butler-types/integration';
import { IApiPropstackFetchPropQueryParams } from '../../shared/types/propstack';
import { PropstackPropMarketTypesEnum } from '@area-butler-types/propstack';

@Exclude()
class ApiPropstackSyncEstatesReqDto
  implements
    Pick<IApiPropstackFetchPropQueryParams, 'status' | 'marketing_type'>
{
  @Expose()
  @IsOptional()
  @Transform(
    ({ obj: { estateStatus } }: { obj: IApiSyncEstatesIntFilterParams }) =>
      `${estateStatus}`,
    { toClassOnly: true },
  )
  @IsString()
  status?: string;

  @Expose()
  @IsOptional()
  @Transform(
    ({ obj: { estateMarketType } }: { obj: IApiSyncEstatesIntFilterParams }) =>
      estateMarketType,
    { toClassOnly: true },
  )
  @IsEnum(PropstackPropMarketTypesEnum)
  marketing_type?: PropstackPropMarketTypesEnum;
}

export default ApiPropstackSyncEstatesReqDto;
