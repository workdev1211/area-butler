import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  OsmName,
  OsmType,
} from '@area-butler-types/types';

class ApiOsmEntityDto implements ApiOsmEntity {
  category: ApiOsmEntityCategory;
  id?: string;
  label: string;
  name: OsmName;
  type: OsmType;
  uniqueRadius?: number;
  uniqueTreshold?: number;
}

export default ApiOsmEntityDto;
