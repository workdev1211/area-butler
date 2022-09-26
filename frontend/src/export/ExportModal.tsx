import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import { UserContext } from "context/UserContext";
import { ApiDataSource } from "../../../shared/types/subscription-plan";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation,
} from "../../../shared/types/types";
import CheatsheetDownload from "./cheatsheet/CheatsheetDownloadButton";
import DocxExpose from "./docx/DocxExpose";
import EntitySelection from "./EntitySelection";
import ExposeDownload from "./expose/ExposeDownloadButton";
import InsightsSelection from "./InsightsSelection";
import MapClippingSelection, {
  SelectedMapClipping,
} from "./MapClippingSelection";
import { EntityGroup, ResultEntity } from "../components/SearchResultContainer";
import { osmEntityTypes } from "../../../shared/constants/constants";
import {
  deriveIconForOsmName,
  sanitizeFilename,
} from "../shared/shared.functions";
import JsZip from "jszip";
import { saveAs } from "file-saver";
import { getRenderedLegend } from "./RenderedLegend";
import { ILegendItem } from "./Legend";

export interface IQrCodeState {
  isShownQrCode: boolean;
  snapshotToken?: string;
}

export interface ExportModalProps {
  entities: ResultEntity[];
  groupedEntries: any;
  censusData?: ApiGeojsonFeature[];
  activeMeans: MeansOfTransportation[];
  snapshotToken?: string;
  exportType?: "CHEATSHEET" | "EXPOSE" | "EXPOSE_DOCX" | "ARCHIVE";
}

const ExportModal: FunctionComponent<ExportModalProps> = ({
  entities,
  groupedEntries,
  censusData = [],
  activeMeans,
  snapshotToken,
  exportType = "EXPOSE",
}) => {
  const groupCopy: EntityGroup[] = JSON.parse(JSON.stringify(groupedEntries))
    .filter((group: EntityGroup) => group.title !== "Meine Objekte")
    .filter((group: EntityGroup) => group.items.length > 0);

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userState } = useContext(UserContext);

  const user = userState.user as ApiUser;
  const subscriptionPlan = user.subscription?.config;

  const hasFederalElectionInSubscription =
    !!subscriptionPlan?.appFeatures.dataSources.includes(
      ApiDataSource.FEDERAL_ELECTION
    );
  const hasCensusElectionInSubscription =
    !!subscriptionPlan?.appFeatures.dataSources.includes(ApiDataSource.CENSUS);
  const hasParticlePollutionElectionInSubscription =
    !!subscriptionPlan?.appFeatures.dataSources.includes(
      ApiDataSource.PARTICLE_POLLUTION
    );
  const selectableClippings = (searchContextState.mapClippings || []).map(
    (c: MapClipping) => ({ selected: true, ...c })
  );

  const getFilteredLegend = (groupedEntities: EntityGroup[]) =>
    groupedEntities
      .reduce<ILegendItem[]>((result, { title, active }) => {
        const foundOsmEntityType =
          active && osmEntityTypes.find(({ label }) => title === label);

        if (foundOsmEntityType) {
          result.push({
            title,
            icon: deriveIconForOsmName(foundOsmEntityType.name),
          });
        }

        return result;
      }, [])
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

  const onClose = () => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
      payload: false,
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
      payload: false,
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
      payload: false,
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_ZIP_ACTIVE,
      payload: false,
    });
  };

  const [filteredEntities, setFilteredEntities] =
    useState<EntityGroup[]>(groupCopy);
  const [legend, setLegend] = useState<ILegendItem[]>(
    getFilteredLegend(groupCopy)
  );
  const [selectedMapClippings, setSelectedMapClippings] =
    useState<SelectedMapClipping[]>(selectableClippings);
  const [qrCodeState, setQrCodeState] = useState<IQrCodeState>({
    snapshotToken,
    isShownQrCode: true,
  });

  const [showFederalElection, setShowFederalElection] = useState(
    hasFederalElectionInSubscription
  );
  const [showCensus, setShowCensus] = useState(hasCensusElectionInSubscription);
  const [showParticlePollution, setShowParticlePollution] = useState(
    hasParticlePollutionElectionInSubscription
  );

  useEffect(() => {
    setLegend(getFilteredLegend(filteredEntities));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEntities]);

  useEffect(() => {
    if (exportType !== "ARCHIVE" || !searchContextState.printingZipActive) {
      return;
    }

    const downloadZipArchive = async () => {
      const zip = new JsZip();

      (await getRenderedLegend(legend)).forEach(({ title, icon }) => {
        zip.file(`icons/${sanitizeFilename(title)}.png`, icon, {
          base64: true,
        });
      });

      const archive = await zip.generateAsync({ type: "blob" });
      saveAs(archive, "AreaButler-Icons.zip");
      onClose();
    };

    void downloadZipArchive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportType, searchContextState.printingZipActive]);

  const buttonTitle =
    exportType !== "CHEATSHEET"
      ? "Umgebungsanalyse exportieren"
      : "Spickzettel exportieren";

  if (searchContextState.printingZipActive) {
    return null;
  }

  return (
    <>
      {(searchContextState.printingActive ||
        searchContextState.printingCheatsheetActive ||
        searchContextState.printingDocxActive) && (
        <div id="expose-modal" className="modal modal-open z-2000">
          <div className="modal-box">
            <h1 className="text-xl text-bold">{buttonTitle}</h1>

            <div className="overflow-y-scroll flex flex-col h-96">
              <div className="mt-5">
                <label
                  className="cursor-pointer label justify-start gap-3"
                  key="show-qr-code"
                >
                  <input
                    type="checkbox"
                    checked={qrCodeState.isShownQrCode}
                    className="checkbox checkbox-primary"
                    onChange={() => {
                      setQrCodeState(
                        qrCodeState.isShownQrCode
                          ? { isShownQrCode: false }
                          : { snapshotToken, isShownQrCode: true }
                      );
                    }}
                  />
                  <span className="label-text">QR code</span>
                </label>
              </div>
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
                groupedEntries={filteredEntities}
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
                  groupedEntries={filteredEntities!}
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
                  user={user}
                  color={searchContextState.responseConfig?.primaryColor}
                  legend={legend}
                  qrCode={qrCodeState}
                />
              )}

              {exportType === "CHEATSHEET" && (
                <CheatsheetDownload
                  entities={entities}
                  groupedEntries={filteredEntities!}
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
                  user={user}
                  color={searchContextState.responseConfig?.primaryColor}
                  legend={legend}
                  qrCode={qrCodeState}
                />
              )}

              {exportType === "EXPOSE_DOCX" && (
                <DocxExpose
                  activeMeans={activeMeans}
                  groupedEntries={filteredEntities!}
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
                  user={user}
                  color={searchContextState.responseConfig?.primaryColor}
                  legend={legend}
                  qrCode={qrCodeState}
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
