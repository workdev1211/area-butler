import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  MeansOfTransportation,
} from '@area-butler-types/types';
import ApiSnippetEntityVisiblityDto from './api-snippet-entity-visiblity.dto';

class ApiSearchResultSnapshotConfigDto
  implements ApiSearchResultSnapshotConfig
{
  defaultActiveGroups?: string[];
  defaultActiveMeans?: MeansOfTransportation[];
  entityVisibility?: ApiSnippetEntityVisiblityDto[];
  fixedRealEstates?: boolean;
  groupItems: boolean;
  mapBoxMapId?: string;
  mapIcon?: string;
  primaryColor?: string;
  showLocation: boolean;
  showAddress?: boolean;
  theme?: ApiSearchResultSnapshotConfigTheme;
  showStreetViewLink?: boolean;
}

export default ApiSearchResultSnapshotConfigDto;
