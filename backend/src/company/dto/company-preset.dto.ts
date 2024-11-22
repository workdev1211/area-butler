import { IsObject, IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { PresetTypesEnum, TCompanyPresets } from '@area-butler-types/company';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';

@Exclude()
class CompanyPresetDto implements TCompanyPresets {
  @Expose()
  @IsOptional()
  @IsObject()
  [PresetTypesEnum.SCREENSHOT]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.DISTRICT_DESC]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.FACEBOOK_POST]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.GENERAL_QUESTION]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.IMPROVE_TEXT]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.INSTAGRAM_CAPTION]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]?: Record<
    string,
    unknown
  >;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.MACRO_LOC_DESC]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.MICRO_LOC_DESC]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsObject()
  [OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION]?: Record<string, unknown>;
}

export default CompanyPresetDto;
