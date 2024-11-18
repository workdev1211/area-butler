import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import { AreaButlerExportTypesEnum } from '@area-butler-types/types';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import ExportMatchingParams from './exp-match-params.dto';
import ExpMatchParams from './exp-match-params.dto';
import { TCompanyExportMatch } from '@area-butler-types/company';

@Exclude()
class ExportMatchingDto implements TCompanyExportMatch {
  @Expose()
  @Type(() => ExpMatchParams)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [AreaButlerExportTypesEnum.INLINE_FRAME]?: ExportMatchingParams;

  @Expose()
  @Type(() => ExpMatchParams)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [AreaButlerExportTypesEnum.LINK_WITH_ADDRESS]?: ExportMatchingParams;

  @Expose()
  @Type(() => ExpMatchParams)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [AreaButlerExportTypesEnum.LINK_WO_ADDRESS]?: ExportMatchingParams;

  @Expose()
  @Type(() => ExpMatchParams)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]?: ExportMatchingParams;

  @Expose()
  @Type(() => ExpMatchParams)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]?: ExportMatchingParams;

  @Expose()
  @Type(() => ExpMatchParams)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]?: ExportMatchingParams;

  @Expose()
  @Type(() => ExpMatchParams)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION]?: ExportMatchingParams;
}

export default ExportMatchingDto;
