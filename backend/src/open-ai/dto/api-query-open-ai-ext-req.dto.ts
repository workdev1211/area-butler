import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  ApiOpenAiQueryTypesEnum,
  IApiQueryOpenAiExtReq,
} from '@area-butler-types/external-api';
import ApiFetchPoiDataReqDto from '../../location/dto/api-fetch-poi-data-req.dto';
import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import { OpenAiTonalityEnum } from '@area-butler-types/open-ai';
import { getEnumValidMessage } from '../../shared/validation.functions';

class ApiQueryOpenAiExtReqDto
  extends ApiFetchPoiDataReqDto
  implements IApiQueryOpenAiExtReq
{
  @IsOptional()
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsEnum(ApiOpenAiQueryTypesEnum, {
    message: getEnumValidMessage,
  })
  queryType?: ApiOpenAiQueryTypesEnum = ApiOpenAiQueryTypesEnum.LOC_DESC;

  @IsOptional()
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsEnum(OpenAiTonalityEnum, {
    message: getEnumValidMessage,
  })
  tonality?: OpenAiTonalityEnum = OpenAiTonalityEnum.FORMAL_SERIOUS;

  @IsOptional()
  @Transform(({ value }: { value: string }): number => +value, {
    toClassOnly: true,
  })
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsEnum(ApiRealEstateCostType, {
    message: getEnumValidMessage,
  })
  priceType?: ApiRealEstateCostType;

  @IsOptional()
  @Transform(({ value }: { value: string }): number => +value, {
    toClassOnly: true,
  })
  @IsNumber()
  @IsPositive()
  housingArea?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }): number => +value, {
    toClassOnly: true,
  })
  @IsNumber()
  @IsPositive()
  totalArea?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsEnum(ApiEnergyEfficiency, {
    message: getEnumValidMessage,
  })
  energyEfficiency?: ApiEnergyEfficiency;

  @IsNotEmpty()
  @Transform(
    ({ value }: { value: string }): string[] =>
      value.split(',').map((furnishItem) => furnishItem.toUpperCase()),
    {
      toClassOnly: true,
    },
  )
  @IsArray()
  @IsEnum(ApiFurnishing, { each: true, message: getEnumValidMessage })
  furnishing: ApiFurnishing[] = [];
}

export default ApiQueryOpenAiExtReqDto;
