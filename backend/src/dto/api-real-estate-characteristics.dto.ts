import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCharacteristics
} from '@area-butler-types/real-estate';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';


class ApiRealEstateCharacteristicsDto implements ApiRealEstateCharacteristics {

  @IsOptional()
  @IsEnum(ApiEnergyEfficiency)
  energyEfficiency?: ApiEnergyEfficiency;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(ApiFurnishing, {each: true})
  furnishing: ApiFurnishing[];

  @IsOptional()
  @IsNumber()
  numberOfRooms: number;

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
