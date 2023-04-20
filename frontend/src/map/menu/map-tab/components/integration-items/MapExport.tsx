import { CSSProperties, FunctionComponent, useContext, useState } from "react";

import { setBackgroundColor } from "../../../../../shared/shared.functions";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../../context/SearchContext";
import reportsIcon from "../../../../../assets/icons/map-menu/09-reporte.svg";
import pdfIcon from "../../../../../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import { EntityGroup } from "../../../../../components/SearchResultContainer";
import OnePageExportModal from "../../../../../export/one-page/OnePageExportModal";

interface IMapExportProps {
  groupedEntries: EntityGroup[];
}

const invertFilter: CSSProperties = { filter: "invert(100%)" };

const MapExport: FunctionComponent<IMapExportProps> = ({ groupedEntries }) => {
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const [isMapExportOpen, setIsMapExportOpen] = useState(false);

  const backgroundColor =
    searchContextState.responseConfig?.primaryColor ||
    "var(--primary-gradient)";

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isMapExportOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsMapExportOpen(!isMapExportOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={reportsIcon} alt="reports-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">
              <div className="collapse-title-text-1 flex gap-2">
                Reporte und Lage Exposé
              </div>
            </div>
            <div className="collapse-title-text-2">
              Für Zahlen, Daten & Fakten zur Lage
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        <div
          className="flex flex-col gap-5 py-5"
          style={{
            paddingLeft: "calc(var(--menu-image-w-h) + 0.75rem)",
            paddingRight: "calc(var(--menu-image-w-h) + 0.75rem)",
          }}
        >
          <h3
            className="flex max-w-fit items-center cursor-pointer gap-2"
            onClick={() => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
                payload: true,
              });
            }}
          >
            <img
              className="w-6 h-6"
              style={invertFilter}
              src={pdfIcon}
              alt="pdf"
            />
            <span>Lage Exposé generieren</span>
          </h3>
        </div>

        {searchContextState.printingOnePageActive && (
          <OnePageExportModal
            groupedEntries={groupedEntries}
            snapshotToken={searchContextState.responseToken}
            snapshotId={searchContextState.integrationSnapshotId!}
            hasOpenAiFeature={true}
          />
        )}
      </div>
    </div>
  );
};

export default MapExport;
