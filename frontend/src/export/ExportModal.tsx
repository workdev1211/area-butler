import {
  MapClipping,
  SearchContext,
  SearchContextActions,
} from "context/SearchContext";
import { UserContext } from "context/UserContext";
import React, { useContext, useState } from "react";
import { ApiDataSource, ApiSubscriptionPlanType } from "../../../shared/types/subscription-plan";
import { ApiGeojsonFeature, ApiUser } from "../../../shared/types/types";
import { EntityGroup, ResultEntity } from "../pages/SearchResultPage";
import CheatsheetDownload from "./cheatsheet/CheatsheetDownloadButton";
import EntitySelection from "./EntitySelection";
import ExposeDownload from "./expose/ExposeDownloadButton";
import InsightsSelectionProps from "./InsightsSelection";
import MapClippingSelection, {
  SelectedMapClipping,
} from "./MapClippingSelection";

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
  const groupCopy: EntityGroup[] = JSON.parse(
    JSON.stringify(groupedEntries)
  ).filter((group: EntityGroup) => group.title !== "Meine Objekte").filter((group: EntityGroup) => group.items.length > 0);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const [filteredEntites, setFilteredEntities] =
    useState<EntityGroup[]>(groupCopy);
  const {userState} = useContext(UserContext);
  const user = userState.user as ApiUser;
  const subscriptionPlan = user.subscriptionPlan?.config;

  const [showFederalElection, setShowFederalElection] = useState(!!subscriptionPlan?.appFeatures.dataSources.includes(ApiDataSource.FEDERAL_ELECTION));
  const [showCensus, setShowCensus] = useState(!!subscriptionPlan?.appFeatures.dataSources.includes(ApiDataSource.CENSUS));
  const [showParticlePollution, setShowParticlePollution] = useState(!!subscriptionPlan?.appFeatures.dataSources.includes(ApiDataSource.PARTICLE_POLLUTION));

  const selectableClippings = (searchContextState.mapClippings || []).map(
    (c: MapClipping) => ({ selected: true, ...c })
  );
  const [selectedMapClippings, setSelectedMapClippings] =
    useState<SelectedMapClipping[]>(selectableClippings);

  const buttonTitle =
    exportType === "EXPOSE"
      ? "Umgebungsanalyse exportieren"
      : "Spickzettel exportieren";

  const onClose = () => {
    searchContextDispatch({
      type: SearchContextActions.SET_PRINTING_ACTIVE,
      payload: false,
    });
    searchContextDispatch({
      type: SearchContextActions.SET_PRINTING_CHEATSHEET_ACTIVE,
      payload: false,
    });
  };

  return (
    <>
      {(searchContextState.printingActive ||
        searchContextState.printingCheatsheetActive) && (
        <div
          id="expose-modal"
          className="modal modal-open z-2000"
        >
          <div className="modal-box">
            <h1 className="text-xl text-bold">
                {buttonTitle}
            </h1>

            <div className="overflow-y-scroll flex flex-col h-96">
              <InsightsSelectionProps
                showCensus={showCensus}
                setShowCensus={setShowCensus}
                showFederalElection={showFederalElection}
                setShowFederalElection={setShowFederalElection}
                showParticlePollution={showParticlePollution}
                setShowParticlePollution={setShowParticlePollution}
              >

              </InsightsSelectionProps>
              <MapClippingSelection
                selectedMapClippings={selectedMapClippings}
                setSelectedMapClippings={setSelectedMapClippings}
              ></MapClippingSelection>
              <EntitySelection
                groupedEntries={filteredEntites}
                setGroupedEntries={setFilteredEntities}
                limit={exportType !== "CHEATSHEET" ? 10 : 3}
              ></EntitySelection>
            </div>

            <div className="modal-action">
              <button type="button" onClick={onClose} className="btn btn-sm">
                Schließen
              </button>
              {exportType !== "CHEATSHEET" ? (
                <ExposeDownload
                  entities={entities}
                  groupedEntries={filteredEntites!}
                  censusData={showCensus ? censusData : []}
                  transportationParams={searchContextState.transportationParams}
                  listingAddress={searchContextState.placesLocation.label}
                  realEstateListing={searchContextState.realEstateListing}
                  downloadButtonDisabled={false}
                  mapClippings={selectedMapClippings}
                  federalElectionData={showFederalElection ? searchContextState.federalElectionData : null}
                  particlePollutionData={showParticlePollution ? searchContextState.particlePollutionData : null}
                  onAfterPrint={() => {}}
                  user={subscriptionPlan?.type !== ApiSubscriptionPlanType.STANDARD ? user : null}
                />
              ) : (
                <CheatsheetDownload
                  entities={entities}
                  groupedEntries={filteredEntites!}
                  censusData={showCensus ? censusData : []}
                  searchResponse={searchContextState.searchResponse!}
                  transportationParams={searchContextState.transportationParams}
                  listingAddress={searchContextState.placesLocation.label}
                  realEstateListing={searchContextState.realEstateListing}
                  downloadButtonDisabled={false}
                  mapClippings={selectedMapClippings}
                  federalElectionData={showFederalElection ? searchContextState.federalElectionData : null}
                  particlePollutionData={showParticlePollution ? searchContextState.particlePollutionData : null}
                  onAfterPrint={onClose}
                  user={subscriptionPlan?.type !== ApiSubscriptionPlanType.STANDARD ? user : null}
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
