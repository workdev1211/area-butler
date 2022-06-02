import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCharacteristics,
} from '@area-butler-types/real-estate';

class ApiRealEstateCharacteristicsDto implements ApiRealEstateCharacteristics {
  @IsOptional()
  @IsEnum(ApiEnergyEfficiency)
  energyEfficiency?: ApiEnergyEfficiency;

  // TODO make "furnishing" completely optional
  @IsNotEmpty()
  @IsArray()
  @IsEnum(ApiFurnishing, { each: true })
  furnishing: ApiFurnishing[];

  @IsOptional()
  @IsNumber()
  numberOfRooms?: number;

  @IsOptional()
  @IsNumber()
  propertySizeInSquareMeters?: number;

  @IsOptional()
  @IsNumber()
  realEstateSizeInSquareMeters?: number;

  @IsOptional()
  @IsBoolean()
  startingAt?: boolean;
}

export default ApiRealEstateCharacteristicsDto;
