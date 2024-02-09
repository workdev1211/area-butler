import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCharacteristics,
} from '@area-butler-types/real-estate';

@Exclude()
class ApiRealEstateCharacteristicsDto implements ApiRealEstateCharacteristics {
  @Expose()
  @IsOptional()
  @IsEnum(ApiEnergyEfficiency)
  energyEfficiency?: ApiEnergyEfficiency;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(ApiFurnishing, { each: true })
  furnishing?: ApiFurnishing[];

  @Expose()
  @IsOptional()
  @IsNumber()
  numberOfRooms?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  propertySizeInSquareMeters?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  realEstateSizeInSquareMeters?: number;

  @Expose()
  @IsOptional()
  @IsBoolean()
  startingAt?: boolean;
}

export default ApiRealEstateCharacteristicsDto;
