import { IsNumber, IsOptional } from 'class-validator';

import { IApiSnapshotIconSizes } from '@area-butler-types/types';

class ApiSnapshotIconSizesDto implements IApiSnapshotIconSizes {
  @IsOptional()
  @IsNumber()
  mapIconSize?: number;

  @IsOptional()
  @IsNumber()
  poiIconSize?: number;
}

export default ApiSnapshotIconSizesDto;
