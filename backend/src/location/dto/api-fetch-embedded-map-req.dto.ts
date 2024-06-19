import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import { IFetchEmbedMapQueryParams } from '@area-butler-types/location';
import { boolStringMapping } from '../../../../shared/constants/constants';

@Exclude()
class ApiFetchEmbeddedMapReqDto implements IFetchEmbedMapQueryParams<boolean> {
  @Expose()
  @IsNotEmpty()
  @IsString()
  token: string;

  @Expose()
  @Transform(
    ({ value }: { value?: string }): boolean | undefined =>
      boolStringMapping[value],
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsBoolean()
  isAddressShown?: boolean;
}

export default ApiFetchEmbeddedMapReqDto;
