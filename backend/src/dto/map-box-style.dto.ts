import { MapBoxStyle } from '@area-butler-types/types';
import { IsNotEmpty } from 'class-validator';

class MapBoxStyleDto implements MapBoxStyle {
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  label: string;
}

export default MapBoxStyleDto;
