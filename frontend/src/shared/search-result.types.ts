import {
  ApiAddress,
  ApiCoordinates,
  ApiSearchResultSnapshotConfig,
  IApiMapboxStyle,
  MeansOfTransportation,
  OsmName,
  TPoiGroupName,
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
  address: ApiAddress;
  byFoot: boolean;
  byBike: boolean;
  byCar: boolean;
  coordinates: ApiCoordinates;
  distanceInMeters: number;
  id: string;
  osmName: OsmName;

  externalUrl?: string;
  isCustom?: boolean; // for a custom added POI
  isFiltered?: boolean;
  name: string;
  // 'realEstateData' property is set in the following shared function:
  // 'deriveInitialEntityGroups' --> 'buildEntDataFromRealEstates'
  realEstateData?: {
    costStructure?: ApiRealEstateCost;
    characteristics?: ApiRealEstateCharacteristics;
    locationIndices?: TApiLocIndexProps;
    type?: string;
  };
  selected?: boolean;
}

export interface EntityGroup {
  active: boolean;
  items: ResultEntity[];
  name: TPoiGroupName;
  title: string;
}

export const poiSearchContainerId = "poi-search-container";

export interface IEditorTabProps {
  availableMeans: MeansOfTransportation[];
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
