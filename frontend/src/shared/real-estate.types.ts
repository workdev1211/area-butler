import {
  ApiCoordinates,
  ApiSearchResultSnapshotConfig,
} from "../../../shared/types/types";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface IFilterRealEstProps {
  config?: ApiSearchResultSnapshotConfig;
  location?: ApiCoordinates;
  realEstates?: ApiRealEstateListing[];
}
