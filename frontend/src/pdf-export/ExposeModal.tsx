import {SearchContext, SearchContextActions} from "context/SearchContext";
import {useContext, useEffect, useState} from "react";
import {ResultEntity} from "search/SearchResult";
import ExposeDownloadButton from "./ExposeDownloadButton";
import {birdsEye, city, nearby} from "./MapClippings";

export interface ExposeModalProps {
  entities: ResultEntity[];
  groupedEntries: any;
}

const waitingTime = 2500;

const zoomLevels = [birdsEye, nearby, city];

export const ExposeModal: React.FunctionComponent<ExposeModalProps> = ({
  entities,
  groupedEntries,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const [printingActive, setPrintingActive] = useState(false);
  const [currentPosition, setCurrentPosition] = useState();

  const currentZoomLevel = searchContextState.selectedZoomLevel;

  const busy = searchContextState.mapClippings.length < 4;

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
        Umgebungsanalyse exportieren
      </button>
      {modalOpen && (
        <div id="expose-modal" className="modal modal-open backdrop-filter backdrop-contrast-0 z-2000">
          <div className="modal-box">
            <h1 className="text-xl text-bold">{busy ? 'Umgebungsanalyse exportieren' : 'Ihre Umgebungsanalyse ist aufbereitet!'}</h1>

            {busy && (
              <>
                <progress className="my-10 progress" value={searchContextState.mapClippings.length} max={4}></progress> 
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
              <ExposeDownloadButton
                entities={entities}
                groupedEntries={groupedEntries!}
                searchResponse={searchContextState.searchResponse!}
                transportationParams={searchContextState.transportationParams}
                listingAddress={searchContextState.placesLocation.label}
                realEstateListing={searchContextState.realEstateListing}
                downloadButtonDisabled={busy}
                mapClippings={searchContextState.mapClippings}
                onAfterPrint={onClose}
              ></ExposeDownloadButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExposeModal;
