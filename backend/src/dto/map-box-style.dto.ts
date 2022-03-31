import { MapBoxStyle } from '@area-butler-types/types';

class MapBoxStyleDto implements MapBoxStyle {
  key: string;
  label: string;
}

export default MapBoxStyleDto;
