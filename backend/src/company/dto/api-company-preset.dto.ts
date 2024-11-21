import {
  IsEnum,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ICompanyPreset, PresetTypesEnum } from '@area-butler-types/company';

@Exclude()
class CompanyPresetDto implements ICompanyPreset{
  @Expose()
  @IsNotEmpty()
  @IsEnum(PresetTypesEnum)
  type: PresetTypesEnum;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  values: Record<string, unknown>;
}

export default CompanyPresetDto;
