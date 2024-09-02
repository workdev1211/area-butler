import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  AreaButlerExportTypesEnum,
  TAreaButlerExportTypes,
} from '@area-butler-types/types';
import { IIntUserExpMatchParams } from '@area-butler-types/integration-user';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import ExportMatchingParams from './exp-match-params.dto';
import ExpMatchParams from './exp-match-params.dto';

@Exclude()
class ExportMatchingDto
  implements Partial<Record<TAreaButlerExportTypes, IIntUserExpMatchParams>>
{
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
}

export default ExportMatchingDto;
