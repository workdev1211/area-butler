import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import {
  IPropstackRealEstateStatus,
  PropstackRealEstStatusesEnum,
} from '../../shared/propstack.types';

class ApiPropstackRealEstStatusDto implements IPropstackRealEstateStatus {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsEnum(PropstackRealEstStatusesEnum)
  name: PropstackRealEstStatusesEnum;

  @IsNotEmpty()
  @IsString()
  color: string;
}

export default ApiPropstackRealEstStatusDto;
