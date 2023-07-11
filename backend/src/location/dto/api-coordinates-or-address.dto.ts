import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

import { IApiCoordinatesOrAddress } from '@area-butler-types/types';

class ApiCoordinatesOrAddressDto implements IApiCoordinatesOrAddress {
  @ValidateIf(({ lat, lng, address }) => (lat && lng) || !address)
  @IsNotEmpty()
  @IsNumberString()
  lat?: string;

  @ValidateIf(({ lat, lng, address }) => (lat && lng) || !address)
  @IsNotEmpty()
  @IsNumberString()
  lng?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export default ApiCoordinatesOrAddressDto;
