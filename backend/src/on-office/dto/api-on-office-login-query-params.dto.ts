import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import { IApiOnOfficeLoginQueryParams } from '@area-butler-types/on-office';
import { processOnOfficeEstateId } from '../shared/on-office.functions';

@Exclude()
class ApiOnOfficeLoginQueryParamsDto implements IApiOnOfficeLoginQueryParams {
  @Expose()
  @IsNotEmpty()
  @IsString()
  apiClaim: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  customerWebId: string;

  @Expose()
  @Transform(({ value }: { value: string }) => processOnOfficeEstateId(value), {
    toClassOnly: true,
  })
  @IsNotEmpty()
  @IsString()
  estateId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  parameterCacheId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  signature: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Expose()
  @IsOptional()
  @IsString()
  groupId?: string;

  @Expose()
  @IsOptional()
  @IsString()
  imageIds?: string;

  @Expose()
  @IsOptional()
  @IsString()
  language?: string;
}

export default ApiOnOfficeLoginQueryParamsDto;
