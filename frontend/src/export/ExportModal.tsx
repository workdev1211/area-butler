import { SearchContext, SearchContextActions } from "context/SearchContext";
import { useContext, useEffect, useState } from "react";
import { ResultEntity } from "search/SearchResult";
import { ApiGeojsonFeature } from "../../../shared/types/types";
import CheatsheetDownload from "./cheatsheet/CheatsheetDownloadButton";
import ExposeDownload from "./expose/ExposeDownloadButton";
import { birdsEye, city, nearby } from "./MapClippings";

export interface ExportModalProps {
  entities: ResultEntity[];
  groupedEntries: any;
  censusData: ApiGeojsonFeature[];
  exportType?: "CHEATSHEET" | "EXPOSE";
}

const waitingTime = 2500;

const zoomLevels = [birdsEye, nearby, city];

export const ExportModal: React.FunctionComponent<ExportModalProps> = ({
  entities,
  groupedEntries,
  censusData,
  exportType = "EXPOSE",
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const [printingActive, setPrintingActive] = useState(false);
  const [currentPosition, setCurrentPosition] = useState();

  const currentZoomLevel = searchContextState.selectedZoomLevel;

  const busy = searchContextState.mapClippings.length < 4;

  const buttonTitle =
    exportType === "EXPOSE"
      ? "Umgebungsanalyse exportieren"
      : "Spickzettel exportieren";
  const headerCompleted =
    exportType === "EXPOSE"
      ? "Ihre Umgebungsanalyse ist aufbereitet!"
      : "Ihr Export ist aufbereitet!";

  const onClose = () => {
    searchContextDispatch({
      type: SearchContextActions.CLEAR_MAP_CLIPPINGS,
    });
    if (!!currentPosition) {
      searchContextDispatch({
        type: SearchContextActions.SET_SELECTED_CENTER,
        payload: currentPosition,
      });
    }
    searchContextDispatch({
      type: SearchContextActions.SET_PRINTING_ACTIVE,
      payload: false,
    });
    setPrintingActive(false);
    setModalOpen(false);
  };

  const setZoomLevel = (zoomLevel: number) => {
    if (printingActive) {
      searchContextDispatch({
        type: SearchContextActions.SET_SELECTED_ZOOM_LEVEL,
        payload: zoomLevel,
      });
    }
  };

  useEffect(() => {
    searchContextDispatch({
      type: SearchContextActions.SET_PRINTING_ACTIVE,
      payload: printingActive,
    });
    if (printingActive) {
      setCurrentPosition(searchContextState.selectedCenter);
      searchContextDispatch({
        type: SearchContextActions.SET_SELECTED_CENTER,
        payload: searchContextState.searchResponse.centerOfInterest.coordinates,
      });
      zoomLevels.map((level, index) =>
        setTimeout(() => setZoomLevel(level), (index + 1) * waitingTime)
      );
      setTimeout(
        () => setZoomLevel(currentZoomLevel),
        (zoomLevels.length + 1) * waitingTime
      );
    }
  }, [printingActive]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setPrintingActive(true);
          setModalOpen(!modalOpen);
        }}
        className="btn btn-primary btn-sm"
      >
        {buttonTitle}
      </button>
      {modalOpen && (
        <div
          id="expose-modal"
          className="modal modal-open backdrop-filter backdrop-contrast-0 z-2000"
        >
          <div className="modal-box">
            <h1 className="text-xl text-bold">
              {busy ? buttonTitle : headerCompleted}
            </h1>

            {busy && (
              <>
                <progress
                  className="my-10 progress"
                  value={searchContextState.mapClippings.length}
                  max={4}
                ></progress>
                <div>Stelle Daten für Export zusammen...</div>
              </>
            )}

            <div className="modal-action">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-sm"
                disabled={busy}
              >
                Schließen
              </button>
              {exportType === "EXPOSE" ? (
                <ExposeDownload
                  entities={entities}
                  groupedEntries={groupedEntries!}
                  censusData={censusData}
                  searchResponse={searchContextState.searchResponse!}
                  transportationParams={searchContextState.transportationParams}
                  listingAddress={searchContextState.placesLocation.label}
                  realEstateListing={searchContextState.realEstateListing}
                  downloadButtonDisabled={busy}
                  mapClippings={searchContextState.mapClippings}
                  onAfterPrint={onClose}
                ></ExposeDownload>
              ) : (
                <CheatsheetDownload
                  entities={entities}
                  groupedEntries={groupedEntries!}
                  censusData={censusData}
                  searchResponse={searchContextState.searchResponse!}
                  transportationParams={searchContextState.transportationParams}
                  listingAddress={searchContextState.placesLocation.label}
                  realEstateListing={searchContextState.realEstateListing}
                  downloadButtonDisabled={busy}
                  mapClippings={searchContextState.mapClippings}
                  onAfterPrint={onClose}
                ></CheatsheetDownload>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportModal;
