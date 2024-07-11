import { FC, useContext, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import {
  ApiDataSource,
  ApiSubscriptionPlanType,
} from "../../../shared/types/subscription-plan";
import { MeansOfTransportation, OsmName } from "../../../shared/types/types";
import CheatsheetDownload from "./cheatsheet/CheatsheetDownloadButton";
import DocxExpose from "./docx/DocxExpose";
import EntitySelection from "./EntitySelection";
import ExposeDownload from "./expose/ExposeDownloadButton";
import InsightsSelection from "./InsightsSelection";
import MapClippingSelection, {
  ISelectableMapClipping,
} from "./MapClippingSelection";
import { EntityGroup } from "../shared/search-result.types";
import { ILegendItem } from "./Legend";
import { getFilteredLegend } from "./shared/shared.functions";
import areaButlerLogo from "../assets/img/logo.svg";
import { useTools } from "../hooks/tools";
import { ExportTypeEnum, IQrCodeState } from "../../../shared/types/export";
import { TCensusData } from "../../../shared/types/data-provision";
import { derivePoiGroupsByActMeans } from "../shared/pois.functions";

interface IExportModalProps {
  censusData?: TCensusData;
  activeMeans: MeansOfTransportation[];
  exportType: ExportTypeEnum;
}

const ExportModal: FC<IExportModalProps> = ({
  censusData,
  activeMeans,
  exportType,
}) => {
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { t } = useTranslation();
  const { getActualUser } = useTools();

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;
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

  const initialSelectableMapClippings = searchContextState.mapClippings.map(
    (c: MapClipping, i) => ({ ...c, id: i, isSelected: true })
  );

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
  };

  const poiItems = useMemo(
    () =>
      derivePoiGroupsByActMeans(
        searchContextState.availGroupedEntities,
        searchContextState.responseActiveMeans
      ).flatMap(({ items }) => items),
    [
      searchContextState.availGroupedEntities,
      searchContextState.responseActiveMeans,
    ]
  );

  const entityGroups: EntityGroup[] = useMemo(
    () =>
      searchContextState.entityGroupsByActMeans.filter(
        ({ name, items }: EntityGroup) =>
          name !== OsmName.property && items.length > 0
      ),
    [searchContextState.entityGroupsByActMeans]
  );

  const [filteredEntities, setFilteredEntities] =
    useState<EntityGroup[]>(entityGroups);
  const [legend, setLegend] = useState<ILegendItem[]>(
    getFilteredLegend(entityGroups)
  );
  const [selectableMapClippings, setSelectableMapClippings] = useState<
    ISelectableMapClipping[]
  >(initialSelectableMapClippings);
  const [qrCodeState, setQrCodeState] = useState<IQrCodeState>({
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

  const buttonTitle =
    exportType !== ExportTypeEnum.CHEATSHEET
      ? t(IntlKeys.snapshotEditor.exportTab.environmentalAnalysisExport)
      : t(IntlKeys.snapshotEditor.exportTab.cheatSheetExport);

  const resultingColor =
    searchContextState.responseConfig?.primaryColor ||
    (isIntegrationUser ? user.config.color : user?.color) ||
    "#aa0c54";
  const resultingLogo =
    (isIntegrationUser ? user.config.logo : user?.logo) || areaButlerLogo;
  const isTrial = !isIntegrationUser
    ? user?.subscription?.type === ApiSubscriptionPlanType.TRIAL
    : false;

  return (
    <>
      {(searchContextState.printingActive ||
        searchContextState.printingCheatsheetActive ||
        searchContextState.printingDocxActive) && (
        <div id="expose-modal" className="modal modal-open z-2000">
          <div className="modal-box">
            <h1 className="text-xl font-bold">{buttonTitle}</h1>

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
                <h1 className="my-5 font-bold">
                  {t(IntlKeys.snapshotEditor.exportTab.pictures)}
                </h1>

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
                        // TODO check if it could be simplified
                        setQrCodeState({
                          isShownQrCode: qrCodeState.isShownQrCode,
                        });
                      }}
                    />
                    <span className="label-text">
                      {t(IntlKeys.common.qrCode)}
                    </span>
                  </label>
                </div>

                <MapClippingSelection
                  selectableMapClippings={selectableMapClippings}
                  setSelectableMapClippings={setSelectableMapClippings}
                />
              </div>

              <EntitySelection
                filteredEntities={filteredEntities}
                setFilteredEntities={setFilteredEntities}
                limit={exportType !== ExportTypeEnum.CHEATSHEET ? 10 : 3}
              />
            </div>

            <div className="modal-action">
              <button type="button" onClick={onClose} className="btn btn-sm">
                {t(IntlKeys.common.close)}
              </button>

              {exportType === ExportTypeEnum.EXPOSE && (
                <ExposeDownload
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
                  entities={poiItems}
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
