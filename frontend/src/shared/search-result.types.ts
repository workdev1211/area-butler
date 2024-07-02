import {
  ApiAddress,
  ApiCoordinates,
  ApiSearchResultSnapshotConfig,
  IApiMapboxStyle,
  MeansOfTransportation,
  OsmName,
} from "../../../shared/types/types";
import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
} from "../../../shared/types/real-estate";
import { TApiLocIndexProps } from "../../../shared/types/location-index";
import { TUnlockIntProduct } from "../../../shared/types/integration";

export interface ICurrentMapRef {
  getZoom: () => number | undefined;
  getCenter: () => ApiCoordinates | undefined;
  handleScrollWheelZoom: {
    isScrollWheelZoomEnabled: () => boolean;
    enableScrollWheelZoom: () => void;
    disableScrollWheelZoom: () => void;
  };
  handleDragging: {
    isDraggingEnabled: () => boolean;
    enableDragging: () => void;
    disableDragging: () => void;
  };
}

export interface ResultEntity {
  name?: string;
  osmName: OsmName;
  label: string;
  id: string;
  coordinates: ApiCoordinates;
  address: ApiAddress;
  byFoot: boolean;
  byBike: boolean;
  byCar: boolean;
  distanceInMeters: number;
  // 'realEstateData' property is set in the following shared function:
  // 'deriveInitialEntityGroups' --> 'buildEntDataFromRealEstates'
  realEstateData?: {
    costStructure?: ApiRealEstateCost;
    characteristics?: ApiRealEstateCharacteristics;
    locationIndices?: TApiLocIndexProps;
    type?: string;
  };
  selected?: boolean;
  externalUrl?: string;
  isFiltered?: boolean;
  isCustom?: boolean; // for a custom added POI
}

export interface EntityGroup {
  title: OsmName;
  active: boolean;
  items: ResultEntity[];
}

export const poiSearchContainerId = "poi-search-container";

export interface IEditorTabProps {
  availableMeans: MeansOfTransportation[];
  groupedEntries?: EntityGroup[];
  config: ApiSearchResultSnapshotConfig;
  onConfigChange: (config: ApiSearchResultSnapshotConfig) => void;
  snapshotId: string;
  extraMapboxStyles?: IApiMapboxStyle[];
  isNewSnapshot: boolean;
}

export interface IExportTabProps {
  searchAddress: string;
  snapshotId: string;
  performUnlock?: TUnlockIntProduct;
}
