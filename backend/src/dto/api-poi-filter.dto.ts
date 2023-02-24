import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import { IApiPoiFilter, PoiFilterTypesEnum } from '@area-butler-types/types';

class ApiPoiFilter implements IApiPoiFilter {
  @IsNotEmpty()
  @IsEnum(PoiFilterTypesEnum)
  type: PoiFilterTypesEnum;

  @IsOptional()
  @IsNumber()
  value?: number;
}

export default ApiPoiFilter;
