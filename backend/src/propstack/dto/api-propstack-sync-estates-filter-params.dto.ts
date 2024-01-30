import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import { IApiSyncEstatesIntFilterParams } from '@area-butler-types/integration';
import { PropstackRealEstMarketTypesEnum } from '@area-butler-types/propstack';
import { IPropstackApiFetchEstsQueryParams } from '../../shared/propstack.types';

@Exclude()
class ApiPropstackSyncEstatesFilterParamsDto
  implements
    Pick<IPropstackApiFetchEstsQueryParams, 'status' | 'marketing_type'>
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
  @IsEnum(PropstackRealEstMarketTypesEnum)
  marketing_type?: string;
}

export default ApiPropstackSyncEstatesFilterParamsDto;
