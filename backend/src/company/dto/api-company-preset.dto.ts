import { IsIn, IsNotEmpty, IsObject } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import {
  IApiCompanyPreset,
  PresetTypesEnum,
  TPresetTypes,
} from '@area-butler-types/company';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';

@Exclude()
class ApiCompanyPresetDto implements IApiCompanyPreset {
  @Expose()
  @IsNotEmpty()
  @IsIn([
    ...Object.values(OpenAiQueryTypeEnum),
    ...Object.values(PresetTypesEnum),
  ])
  type: TPresetTypes;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  values: Record<string, unknown>;
}

export default ApiCompanyPresetDto;
