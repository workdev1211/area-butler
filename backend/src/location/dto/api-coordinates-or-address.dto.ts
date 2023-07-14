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
  @ValidateIf(({ lat, lng, address }) => (lat && lng) || !address)
  @IsNotEmpty()
  @Transform(({ value }) => +value, { toClassOnly: true })
  @IsNumber()
  lat?: number;

  @ValidateIf(({ lat, lng, address }) => (lat && lng) || !address)
  @IsNotEmpty()
  @Transform(({ value }) => +value, { toClassOnly: true })
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  address?: string;
}

export default ApiCoordinatesOrAddressDto;
