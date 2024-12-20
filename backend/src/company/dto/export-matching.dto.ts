import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import { AreaButlerExportTypesEnum } from '@area-butler-types/types';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { TCompanyExportMatch } from '@area-butler-types/company';
import ExpMatchParamsDto from './exp-match-params.dto';
import { IIntUserExpMatchTextParams } from '@area-butler-types/integration-user';

@Exclude()
class ExportMatchingDto implements TCompanyExportMatch {
  @Expose()
  @Type(() => ExpMatchParamsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [AreaButlerExportTypesEnum.INLINE_FRAME]?: IIntUserExpMatchTextParams;

  @Expose()
  @Type(() => ExpMatchParamsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [AreaButlerExportTypesEnum.LINK_WITH_ADDRESS]?: IIntUserExpMatchTextParams;

  @Expose()
  @Type(() => ExpMatchParamsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [AreaButlerExportTypesEnum.LINK_WO_ADDRESS]?: IIntUserExpMatchTextParams;

  @Expose()
  @Type(() => ExpMatchParamsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]?: IIntUserExpMatchTextParams;

  @Expose()
  @Type(() => ExpMatchParamsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]?: IIntUserExpMatchTextParams;

  @Expose()
  @Type(() => ExpMatchParamsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]?: IIntUserExpMatchTextParams;

  @Expose()
  @Type(() => ExpMatchParamsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION]?: IIntUserExpMatchTextParams;
}

export default ExportMatchingDto;
