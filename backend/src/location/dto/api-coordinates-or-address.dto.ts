import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { IApiCoordinatesOrAddress } from '@area-butler-types/types';

class ApiCoordinatesOrAddressDto implements IApiCoordinatesOrAddress {
  @Transform(({ value }) => +value, { toClassOnly: true })
  @ValidateIf(({ lat, lng, address }) => (lat && lng) || !address)
  @IsNotEmpty()
  @IsNumber()
  lat?: number;

  @Transform(({ value }) => +value, { toClassOnly: true })
  @ValidateIf(({ lat, lng, address }) => (lat && lng) || !address)
  @IsNotEmpty()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  address?: string;
}

export default ApiCoordinatesOrAddressDto;
