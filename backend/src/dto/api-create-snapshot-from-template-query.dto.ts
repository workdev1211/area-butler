import {
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiCoordinates,
  IApiCreateSnapshotFromTemplateQuery,
} from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';

class ApiCreateSnapshotFromTemplateQueryDto
  implements IApiCreateSnapshotFromTemplateQuery
{
  @ValidateIf(({ address }) => !address)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates?: ApiCoordinates;

  @ValidateIf(({ coordinates }) => !coordinates)
  @IsNotEmpty()
  @IsString()
  address?: string;

  @IsNotEmpty()
  @IsString()
  snapshotId: string;
}

export default ApiCreateSnapshotFromTemplateQueryDto;
