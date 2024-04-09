import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  ApiOpenAiQueryTypesEnum,
  IApiQueryOpenAiExtReq,
} from '../../shared/types/external-api';
import ApiFetchPoiDataReqDto from '../../location/dto/api-fetch-poi-data-req.dto';
import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import { OpenAiTonalityEnum } from '@area-butler-types/open-ai';
import { getEnumValidMessage } from '../../shared/functions/validation';

class ApiQueryOpenAiExtReqDto
  extends ApiFetchPoiDataReqDto
  implements IApiQueryOpenAiExtReq
{
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsEnum(ApiOpenAiQueryTypesEnum, {
    message: getEnumValidMessage,
  })
  queryType?: ApiOpenAiQueryTypesEnum = ApiOpenAiQueryTypesEnum.LOC_DESC;

  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsEnum(OpenAiTonalityEnum, {
    message: getEnumValidMessage,
  })
  tonality?: OpenAiTonalityEnum = OpenAiTonalityEnum.FORMAL_SERIOUS;

  @Transform(({ value }: { value: string }): number => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxTextLength?: number;

  @Transform(({ value }: { value: string }): number => +value, {
    toClassOnly: true,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsEnum(ApiRealEstateCostType, {
    message: getEnumValidMessage,
  })
  priceType?: ApiRealEstateCostType;

  @Transform(({ value }: { value: string }): number => +value, {
    toClassOnly: true,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  housingArea?: number;

  @Transform(({ value }: { value: string }): number => +value, {
    toClassOnly: true,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalArea?: number;

  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsEnum(ApiEnergyEfficiency, {
    message: getEnumValidMessage,
  })
  energyEfficiency?: ApiEnergyEfficiency;

  @Transform(
    ({ value }: { value: string }): string[] =>
      value?.split(',').map((furnishItem) => furnishItem.toUpperCase()),
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsArray()
  @IsEnum(ApiFurnishing, { each: true, message: getEnumValidMessage })
  furnishing?: ApiFurnishing[];
}

export default ApiQueryOpenAiExtReqDto;
