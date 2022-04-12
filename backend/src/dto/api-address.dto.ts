import { ApiAddress } from '@area-butler-types/types';
import { IsOptional } from 'class-validator';

class ApiAddressDto implements ApiAddress {
  @IsOptional()
  street?: string;

  @IsOptional()
  postalCode?: string;

  @IsOptional()
  city?: string;
}

export default ApiAddressDto;
