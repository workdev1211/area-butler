import {
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiCoordinates,
  IApiCreateSnapshotFromTemplate,
} from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';

class ApiCreateSnapshotFromTemplateDto
  implements IApiCreateSnapshotFromTemplate
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

export default ApiCreateSnapshotFromTemplateDto;
