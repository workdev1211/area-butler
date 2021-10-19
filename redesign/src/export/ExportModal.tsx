import {SearchContext, SearchContextActions} from "context/SearchContext";
import React, {useContext, useEffect} from "react";
import {ApiGeojsonFeature} from "../../../shared/types/types";
import {ResultEntity} from "../pages/SearchResultPage";
import {birdsEye, city, nearby} from "./MapClippings";
import ExposeDownload from "./expose/ExposeDownloadButton";
import CheatsheetDownload from "./cheatsheet/CheatsheetDownloadButton";

export interface ExportModalProps {
    entities: ResultEntity[];
    groupedEntries: any;
    censusData: ApiGeojsonFeature[];
    exportType?: "CHEATSHEET" | "EXPOSE";
}

const ExportModal: React.FunctionComponent<ExportModalProps> = ({
                                                                    entities,
                                                                    groupedEntries,
                                                                    censusData,
                                                                    exportType = "EXPOSE",
                                                                }) => {
    const {searchContextState, searchContextDispatch} = useContext(SearchContext);

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
            type: SearchContextActions.SET_PRINTING_ACTIVE,
            payload: false,
        });
        searchContextDispatch({
            type: SearchContextActions.SET_PRINTING_CHEATSHEET_ACTIVE,
            payload: false,
        });
        searchContextDispatch({
            type: SearchContextActions.CLEAR_MAP_CLIPPINGS,
        });
    };

    useEffect(() => {
        if (searchContextState.printingActive) {
            const waitingTime = 2500;
            const zoomLevels = [birdsEye, nearby, city];
            zoomLevels.map((level, index) =>
                setTimeout(() => searchContextDispatch({
                    type: SearchContextActions.SET_MAP_ZOOM_LEVEL,
                    payload: level
                }), (index + 1) * waitingTime)
            );
        }
    }, [searchContextState.printingActive, searchContextDispatch])

    useEffect(() => {
        if (searchContextState.printingCheatsheetActive) {
            const waitingTime = 2500;
            const zoomLevels = [birdsEye, nearby, city];
            zoomLevels.map((level, index) =>
                setTimeout(() => searchContextDispatch({
                    type: SearchContextActions.SET_MAP_ZOOM_LEVEL,
                    payload: level
                }), (index + 1) * waitingTime)
            );
        }
    }, [searchContextState.printingCheatsheetActive, searchContextDispatch])

    return (
        <>
            {(searchContextState.printingActive || searchContextState.printingCheatsheetActive) && (
                <div
                    id="expose-modal"
                    className="modal modal-open backdrop-filter backdrop-contrast-0 z-2000"
                >
                    <div className="modal-box">
                        <h1 className="text-xl text-bold">
                            {searchContextState.mapClippings.length < 4 ? buttonTitle : headerCompleted}
                        </h1>

                        {searchContextState.mapClippings.length < 4 && (
                            <>
                                <progress
                                    className="my-10 progress"
                                    value={searchContextState.mapClippings.length}
                                    max={4}
                                />
                                <div>Stelle Daten für Export zusammen...</div>
                            </>
                        )}
                        <div className="modal-action">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-sm"
                                disabled={searchContextState.mapClippings.length < 4}
                            >
                                Schließen
                            </button>
                            {exportType !== "CHEATSHEET" ? (
                                <ExposeDownload
                                    entities={entities}
                                    groupedEntries={groupedEntries!}
                                    censusData={censusData}
                                    searchResponse={searchContextState.searchResponse!}
                                    transportationParams={searchContextState.transportationParams}
                                    listingAddress={searchContextState.placesLocation.label}
                                    realEstateListing={searchContextState.realEstateListing}
                                    downloadButtonDisabled={searchContextState.mapClippings.length < 4}
                                    mapClippings={searchContextState.mapClippings}
                                    onAfterPrint={onClose}
                                />
                            ) : (
                                <CheatsheetDownload
                                    entities={entities}
                                    groupedEntries={groupedEntries!}
                                    censusData={censusData}
                                    searchResponse={searchContextState.searchResponse!}
                                    transportationParams={searchContextState.transportationParams}
                                    listingAddress={searchContextState.placesLocation.label}
                                    realEstateListing={searchContextState.realEstateListing}
                                    downloadButtonDisabled={searchContextState.mapClippings.length < 4}
                                    mapClippings={searchContextState.mapClippings}
                                    onAfterPrint={onClose}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportModal;
