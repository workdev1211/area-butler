import { ISortableEntityGroup } from "../export/one-page/OnePageExportModal";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { ILegendItem } from "../export/Legend";
import { ISelectableMapClipping } from "../export/MapClippingSelection";
import {
  ApiSearchResultSnapshotConfig,
  IApiUserExportFont,
} from "../../../shared/types/types";

export interface IOnePageDownProps {
  addressDescription: string;
  entityGroups: ISortableEntityGroup[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  color: string;
  logo: string;
  legend: ILegendItem[];
  mapClippings: ISelectableMapClipping[];
  snapshotConfig: ApiSearchResultSnapshotConfig;
  isTrial: boolean;
  qrCodeImage?: string;
  downloadButtonDisabled?: boolean;
}

export interface IOnePagePdfDownProps extends IOnePageDownProps {
  onAfterPrint: () => void;
}

export interface IOnePagePngDownProps
  extends Omit<IOnePageDownProps, "legend"> {
  isTransparentBackground: boolean;
  exportFonts?: IApiUserExportFont[];
}

export interface IOnePagePngProps extends Omit<IOnePageDownProps, "legend"> {
  isTransparentBackground: boolean;
  style: string;
}

export interface IOnePageMapQrCodeProps {
  mapClippings: ISelectableMapClipping[];
  color: string;
  qrCodeImage?: string;
}
