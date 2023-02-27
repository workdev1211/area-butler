import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import {
  IApiSnapshotPoiFilter,
  PoiFilterTypesEnum,
} from '@area-butler-types/types';

class ApiSnapshotPoiFilterDto implements IApiSnapshotPoiFilter {
  @IsNotEmpty()
  @IsEnum(PoiFilterTypesEnum)
  type: PoiFilterTypesEnum;

  @IsOptional()
  @IsNumber()
  value?: number;
}

export default ApiSnapshotPoiFilterDto;
