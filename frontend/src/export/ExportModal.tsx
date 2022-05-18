import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes
} from "context/SearchContext";
import { UserContext } from "context/UserContext";
import React, { useContext, useState } from "react";
import {
  ApiDataSource,
  ApiSubscriptionPlanType
} from "../../../shared/types/subscription-plan";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation
} from "../../../shared/types/types";
import CheatsheetDownload from "./cheatsheet/CheatsheetDownloadButton";
import DocxExpose from "./docx/DocxExpose";
import EntitySelection from "./EntitySelection";
import ExposeDownload from "./expose/ExposeDownloadButton";
import InsightsSelection from "./InsightsSelection";
import MapClippingSelection, {
  SelectedMapClipping
} from "./MapClippingSelection";
import { EntityGroup, ResultEntity } from "../components/SearchResultContainer";

export interface ExportModalProps {
  entities: ResultEntity[];
  groupedEntries: any;
  censusData: ApiGeojsonFeature[];
  activeMeans: MeansOfTransportation[];
  exportType?: "CHEATSHEET" | "EXPOSE" | "EXPOSE_DOCX";
}

const ExportModal: React.FunctionComponent<ExportModalProps> = ({
  entities,
  groupedEntries,
  censusData,
  activeMeans,
  exportType = "EXPOSE"
}) => {
  const groupCopy: EntityGroup[] = JSON.parse(JSON.stringify(groupedEntries))
    .filter((group: EntityGroup) => group.title !== "Meine Objekte")
    .filter((group: EntityGroup) => group.items.length > 0);
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );
  const [filteredEntites, setFilteredEntities] = useState<EntityGroup[]>(
    groupCopy
  );
  const { userState } = useContext(UserContext);
  const user = userState.user as ApiUser;
  const subscriptionPlan = user.subscriptionPlan?.config;

  const hasFederalElectionInSubscription = !!subscriptionPlan?.appFeatures.dataSources.includes(
    ApiDataSource.FEDERAL_ELECTION
  );
  const hasCensusElectionInSubscription = !!subscriptionPlan?.appFeatures.dataSources.includes(
    ApiDataSource.CENSUS
  );
  const hasParticlePollutionElectionInSubscription = !!subscriptionPlan?.appFeatures.dataSources.includes(
    ApiDataSource.PARTICLE_POLLUTION
  );

  const [showFederalElection, setShowFederalElection] = useState(
    hasFederalElectionInSubscription
  );
  const [showCensus, setShowCensus] = useState(hasCensusElectionInSubscription);
  const [showParticlePollution, setShowParticlePollution] = useState(
    hasParticlePollutionElectionInSubscription
  );

  const selectableClippings = (
    searchContextState.mapClippings || []
  ).map((c: MapClipping) => ({ selected: true, ...c }));
  const [selectedMapClippings, setSelectedMapClippings] = useState<
    SelectedMapClipping[]
  >(selectableClippings);

  const buttonTitle =
    exportType !== "CHEATSHEET"
      ? "Umgebungsanalyse exportieren"
      : "Spickzettel exportieren";

  const onClose = () => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
      payload: false
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
      payload: false
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
      payload: false
    });
  };

  return (
    <>
      {(searchContextState.printingActive ||
        searchContextState.printingCheatsheetActive ||
        searchContextState.printingDocxActive) && (
        <div id="expose-modal" className="modal modal-open z-2000">
          <div className="modal-box">
            <h1 className="text-xl text-bold">{buttonTitle}</h1>

            <div className="overflow-y-scroll flex flex-col h-96">
              {(hasCensusElectionInSubscription ||
                hasFederalElectionInSubscription ||
                hasParticlePollutionElectionInSubscription) && (
                <InsightsSelection
                  showCensus={showCensus}
                  setShowCensus={setShowCensus}
                  showFederalElection={showFederalElection}
                  setShowFederalElection={setShowFederalElection}
                  showParticlePollution={showParticlePollution}
                  setShowParticlePollution={setShowParticlePollution}
                  hasCensusInSubscription={hasCensusElectionInSubscription}
                  hasFederalElectionInSubscription={
                    hasFederalElectionInSubscription
                  }
                  hasParticlePollutionInSubscription={
                    hasParticlePollutionElectionInSubscription
                  }
                />
              )}
              <MapClippingSelection
                selectedMapClippings={selectedMapClippings}
                setSelectedMapClippings={setSelectedMapClippings}
              />
              <EntitySelection
                groupedEntries={filteredEntites}
                setGroupedEntries={setFilteredEntities}
                limit={exportType !== "CHEATSHEET" ? 10 : 3}
              />
            </div>

            <div className="modal-action">
              <button type="button" onClick={onClose} className="btn btn-sm">
                Schließen
              </button>
              {exportType === "EXPOSE" && (
                <ExposeDownload
                  entities={entities}
                  groupedEntries={filteredEntites!}
                  censusData={showCensus ? censusData : []}
                  transportationParams={searchContextState.transportationParams}
                  activeMeans={activeMeans}
                  listingAddress={searchContextState.placesLocation.label}
                  realEstateListing={searchContextState.realEstateListing!}
                  downloadButtonDisabled={false}
                  mapClippings={selectedMapClippings}
                  federalElectionData={
                    showFederalElection
                      ? searchContextState.federalElectionData
                      : undefined
                  }
                  particlePollutionData={
                    showParticlePollution
                      ? searchContextState.particlePollutionData
                      : undefined
                  }
                  onAfterPrint={onClose}
                  user={
                    subscriptionPlan?.type !== ApiSubscriptionPlanType.STANDARD
                      ? user
                      : null
                  }
                  color={searchContextState.responseConfig?.primaryColor}
                />
              )}

              {exportType === "CHEATSHEET" && (
                <CheatsheetDownload
                  entities={entities}
                  groupedEntries={filteredEntites!}
                  censusData={showCensus ? censusData : []}
                  searchResponse={searchContextState.searchResponse!}
                  transportationParams={searchContextState.transportationParams}
                  listingAddress={searchContextState.placesLocation.label}
                  realEstateListing={searchContextState.realEstateListing!}
                  downloadButtonDisabled={false}
                  mapClippings={selectedMapClippings}
                  federalElectionData={
                    showFederalElection
                      ? searchContextState.federalElectionData
                      : undefined
                  }
                  particlePollutionData={
                    showParticlePollution
                      ? searchContextState.particlePollutionData
                      : undefined
                  }
                  onAfterPrint={onClose}
                  user={
                    subscriptionPlan?.type !== ApiSubscriptionPlanType.STANDARD
                      ? user
                      : null
                  }
                  color={searchContextState.responseConfig?.primaryColor}
                />
              )}

              {exportType === "EXPOSE_DOCX" && (
                <DocxExpose
                  activeMeans={activeMeans}
                  groupedEntries={filteredEntites!}
                  censusData={showCensus ? censusData : []}
                  transportationParams={searchContextState.transportationParams}
                  listingAddress={searchContextState.placesLocation.label}
                  realEstateListing={searchContextState.realEstateListing!}
                  mapClippings={selectedMapClippings}
                  federalElectionData={
                    showFederalElection
                      ? searchContextState.federalElectionData
                      : undefined
                  }
                  particlePollutionData={
                    showParticlePollution
                      ? searchContextState.particlePollutionData
                      : undefined
                  }
                  user={
                    subscriptionPlan?.type !== ApiSubscriptionPlanType.STANDARD
                      ? user
                      : null
                  }
                  color={searchContextState.responseConfig?.primaryColor}
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
