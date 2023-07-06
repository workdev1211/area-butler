import { FunctionComponent, useContext, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import JsZip from "jszip";

import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import {
  ApiDataSource,
  ApiSubscriptionPlanType,
} from "../../../shared/types/subscription-plan";
import { MeansOfTransportation } from "../../../shared/types/types";
import CheatsheetDownload from "./cheatsheet/CheatsheetDownloadButton";
import DocxExpose from "./docx/DocxExpose";
import EntitySelection from "./EntitySelection";
import ExposeDownload from "./expose/ExposeDownloadButton";
import InsightsSelection from "./InsightsSelection";
import MapClippingSelection, {
  ISelectableMapClipping,
} from "./MapClippingSelection";
import { EntityGroup, ResultEntity } from "../components/SearchResultContainer";
import {
  realEstateListingsTitle,
  sanitizeFilename,
} from "../shared/shared.functions";
import { getRenderedLegend } from "./RenderedLegend";
import { ILegendItem } from "./Legend";
import { getFilteredLegend } from "./shared/shared.functions";
import { TCensusData } from "../hooks/censusdata";
import areaButlerLogo from "../assets/img/logo.svg";
import { useTools } from "../hooks/tools";
import { ExportTypeEnum, IQrCodeState } from "../../../shared/types/export";

interface IExportModalProps {
  entities: ResultEntity[];
  groupedEntries: any;
  censusData?: TCensusData;
  activeMeans: MeansOfTransportation[];
  snapshotToken?: string;
  exportType: ExportTypeEnum;
}

const ExportModal: FunctionComponent<IExportModalProps> = ({
  entities,
  groupedEntries,
  censusData,
  activeMeans,
  snapshotToken,
  exportType,
}) => {
  const groupCopy: EntityGroup[] = JSON.parse(
    JSON.stringify(groupedEntries)
  ).filter(
    ({ title, items }: EntityGroup) =>
      title !== realEstateListingsTitle && items.length > 0
  );

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { getActualUser } = useTools();

  const user = getActualUser();
  const isIntegrationUser = "accessToken" in user;
  const subscriptionPlan = isIntegrationUser
    ? undefined
    : user.subscription?.config;

  const hasFederalElectionInSubscription =
    isIntegrationUser ||
    !!subscriptionPlan?.appFeatures.dataSources.includes(
      ApiDataSource.FEDERAL_ELECTION
    );
  const hasCensusElectionInSubscription =
    isIntegrationUser ||
    !!subscriptionPlan?.appFeatures.dataSources.includes(ApiDataSource.CENSUS);
  const hasParticlePollutionElectionInSubscription =
    isIntegrationUser ||
    !!subscriptionPlan?.appFeatures.dataSources.includes(
      ApiDataSource.PARTICLE_POLLUTION
    );

  const initialSelectableMapClippings = (
    searchContextState.mapClippings || []
  ).map((c: MapClipping, i) => ({ ...c, id: i, isSelected: true }));

  const onClose = (): void => {
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
  const [selectableMapClippings, setSelectableMapClippings] = useState<
    ISelectableMapClipping[]
  >(initialSelectableMapClippings);
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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLegend(getFilteredLegend(filteredEntities));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEntities]);

  useEffect(() => {
    if (
      exportType !== ExportTypeEnum.ARCHIVE ||
      !searchContextState.printingZipActive
    ) {
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
    exportType !== ExportTypeEnum.CHEATSHEET
      ? "Umgebungsanalyse exportieren"
      : "Spickzettel exportieren";

  const resultingColor =
    searchContextState.responseConfig?.primaryColor ||
    (!isIntegrationUser && user?.color) ||
    "#aa0c54";
  const resultingLogo = (!isIntegrationUser && user?.logo) || areaButlerLogo;
  const isTrial = !isIntegrationUser
    ? user?.subscription?.type === ApiSubscriptionPlanType.TRIAL
    : false;

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

              <div>
                <h1 className="my-5 font-bold">Bilder</h1>

                <div className="mb-5">
                  <label
                    className="cursor-pointer label justify-start gap-3 py-0"
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

                <MapClippingSelection
                  selectableMapClippings={selectableMapClippings}
                  setSelectableMapClippings={setSelectableMapClippings}
                />
              </div>

              <EntitySelection
                groupedEntries={filteredEntities}
                setGroupedEntries={setFilteredEntities}
                limit={exportType !== ExportTypeEnum.CHEATSHEET ? 10 : 3}
              />
            </div>

            <div className="modal-action">
              <button type="button" onClick={onClose} className="btn btn-sm">
                Schließen
              </button>

              {exportType === ExportTypeEnum.EXPOSE && (
                <ExposeDownload
                  entities={entities}
                  groupedEntries={filteredEntities!}
                  censusData={showCensus ? censusData : undefined}
                  transportationParams={searchContextState.transportationParams}
                  activeMeans={activeMeans}
                  listingAddress={searchContextState.placesLocation?.label}
                  realEstateListing={searchContextState.realEstateListing!}
                  downloadButtonDisabled={false}
                  mapClippings={selectableMapClippings}
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
                  color={resultingColor}
                  logo={resultingLogo}
                  isTrial={isTrial}
                  legend={legend}
                  qrCode={qrCodeState}
                />
              )}

              {exportType === ExportTypeEnum.CHEATSHEET && (
                <CheatsheetDownload
                  entities={entities}
                  groupedEntries={filteredEntities!}
                  censusData={showCensus ? censusData : undefined}
                  searchResponse={searchContextState.searchResponse!}
                  transportationParams={searchContextState.transportationParams}
                  listingAddress={searchContextState.placesLocation?.label}
                  realEstateListing={searchContextState.realEstateListing!}
                  downloadButtonDisabled={false}
                  mapClippings={selectableMapClippings}
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
                  color={resultingColor}
                  logo={resultingLogo}
                  isTrial={isTrial}
                  legend={legend}
                  qrCode={qrCodeState}
                />
              )}

              {exportType === ExportTypeEnum.EXPOSE_DOCX && (
                <DocxExpose
                  activeMeans={activeMeans}
                  groupedEntries={filteredEntities!}
                  censusData={showCensus ? censusData : undefined}
                  transportationParams={searchContextState.transportationParams}
                  listingAddress={searchContextState.placesLocation?.label}
                  realEstateListing={searchContextState.realEstateListing!}
                  mapClippings={selectableMapClippings}
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
                  color={resultingColor}
                  logo={resultingLogo}
                  isTrial={isTrial}
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
