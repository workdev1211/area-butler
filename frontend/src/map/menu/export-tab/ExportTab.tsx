import { FunctionComponent, useContext, useEffect, useState } from "react";

import "./ExportTab.scss";

import { IExportTabProps } from "components/SearchResultContainer";
import {
  deriveEntityGroupsByActiveMeans,
  setBackgroundColor,
  toastSuccess,
} from "../../../shared/shared.functions";
import { SearchContext } from "../../../context/SearchContext";
import MapClippingsCollapsable from "../components/MapClippingsCollapsable";
import aiIcon from "../../../assets/icons/ai-big.svg";
import editIcon from "../../../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import mapScreenshotsIcon from "../../../assets/icons/map-menu/07-kartenausschnitte.svg";
import digitalMediaIcon from "../../../assets/icons/map-menu/08-digitale-medien.svg";
import reportsIcon from "../../../assets/icons/map-menu/09-reporte.svg";
import aiDescriptionIcon from "../../../assets/icons/map-menu/10-ki-lagetexte.svg";
// TODO start - waits for the customer
// import webLinkIcon from "../../../assets/icons/link.svg";
import fileIcon from "../../../assets/icons/file.svg";
// TODO end
import ExportModal, { ExportTypeEnum } from "../../../export/ExportModal";
import OnePageExportModal from "../../../export/one-page/OnePageExportModal";
import { localStorageSearchContext } from "../../../../../shared/constants/constants";
import OpenAiModal from "../../../components/OpenAiModal";
import { openAiQueryTypes } from "../../../../../shared/constants/open-ai";
import { OpenAiQueryTypeEnum } from "../../../../../shared/types/open-ai";
import { invertFilter } from "../../../shared/shared.constants";
import { useTools } from "../../../hooks/tools";
import DigitalMedia from "./components/DigitalMedia";
import LocationExport from "./components/LocationExport";

const ExportTab: FunctionComponent<IExportTabProps> = ({
  codeSnippet,
  directLink,
  searchAddress,
  snapshotId,
}) => {
  const { searchContextState } = useContext(SearchContext);

  const { getActualUser } = useTools();
  const user = getActualUser();
  const isIntegrationUser = "accessToken" in user;

  const [exportType, setExportType] = useState<ExportTypeEnum | undefined>();
  const [isShownOpenAiModal, setIsShownOpenAiModal] = useState(false);
  const [openAiQueryType, setOpenAiQueryType] = useState<OpenAiQueryTypeEnum>();
  const [isMapScreenshotsOpen, setIsMapScreenshotsOpen] = useState(false);
  const [isDigitalMediaOpen, setIsDigitalMediaOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAiDescriptionOpen, setIsAiDescriptionOpen] = useState(false);
  // TODO waits for the customer
  // const [isCustomerLinksOpen, setIsCustomerLinksOpen] = useState(false);
  const [isCustomerDataOpen, setIsCustomerDataOpen] = useState(false);

  useEffect(() => {
    if (
      !searchContextState.printingActive &&
      !searchContextState.printingDocxActive &&
      !searchContextState.printingCheatsheetActive &&
      !searchContextState.printingZipActive &&
      !searchContextState.printingOnePageActive
    ) {
      setExportType(undefined);
      return;
    }

    let currentExportType: ExportTypeEnum;

    if (searchContextState.printingActive) {
      currentExportType = ExportTypeEnum.EXPOSE;
    }

    if (searchContextState.printingDocxActive) {
      currentExportType = ExportTypeEnum.EXPOSE_DOCX;
    }

    if (searchContextState.printingCheatsheetActive) {
      currentExportType = ExportTypeEnum.CHEATSHEET;
    }

    if (searchContextState.printingZipActive) {
      currentExportType = ExportTypeEnum.ARCHIVE;
    }

    if (searchContextState.printingOnePageActive) {
      currentExportType = ExportTypeEnum.ONE_PAGE;
    }

    setExportType(currentExportType!);
  }, [
    searchContextState.printingActive,
    searchContextState.printingDocxActive,
    searchContextState.printingCheatsheetActive,
    searchContextState.printingZipActive,
    searchContextState.printingOnePageActive,
  ]);

  const clippings = searchContextState.mapClippings;

  const entityGroups = deriveEntityGroupsByActiveMeans(
    searchContextState.responseGroupedEntities,
    searchContextState.responseActiveMeans
  );

  const resultingGroups = entityGroups.map((g) => g.items).flat();

  // TODO change it
  const hasOpenAiFeature =
    isIntegrationUser || !!user?.subscription?.config.appFeatures.openAi;

  const backgroundColor =
    searchContextState.responseConfig?.primaryColor ||
    "var(--primary-gradient)";

  return (
    <>
      <div className="export-tab z-9000">
        {hasOpenAiFeature && isShownOpenAiModal && (
          <OpenAiModal
            closeModal={() => {
              setIsShownOpenAiModal(false);
            }}
            searchResultSnapshotId={snapshotId}
            queryType={openAiQueryType}
          />
        )}

        <div
          className={
            "collapse collapse-arrow view-option" +
            (isMapScreenshotsOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsMapScreenshotsOpen(!isMapScreenshotsOpen);
            }}
          >
            <div className="collapse-title-container">
              <img src={mapScreenshotsIcon} alt="map-screenshots-icon" />
              <div className="collapse-title-text">
                <div className="collapse-title-text-1">Kartenausschnitte</div>
                <div className="collapse-title-text-2">
                  Für Exposés, Print Medien, Bildergalerien
                </div>
              </div>
            </div>
          </div>
          <div className="collapse-content">
            {clippings.length > 0 ? (
              <MapClippingsCollapsable
                searchAddress={searchAddress}
                clippings={clippings}
              />
            ) : (
              <div
                className="text-justify"
                style={{
                  padding:
                    "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
                }}
              >
                Bitte verwenden Sie den Screenshot-Button in der unteren linken
                Ecke der Karte.
              </div>
            )}
          </div>
        </div>

        <div
          className={
            "collapse collapse-arrow view-option" +
            (isDigitalMediaOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsDigitalMediaOpen(!isDigitalMediaOpen);
            }}
          >
            <div className="collapse-title-container">
              <img src={digitalMediaIcon} alt="digital-media-icon" />
              <div className="collapse-title-text">
                <div className="collapse-title-text-1">Digitale Medien</div>
                <div className="collapse-title-text-2">
                  Für Webseite, Exposés, E-Mail
                </div>
              </div>
            </div>
          </div>
          <div className="collapse-content">
            <DigitalMedia
              codeSnippet={codeSnippet}
              directLink={directLink}
              searchAddress={searchAddress}
            />
          </div>
        </div>

        <div
          className={
            "collapse collapse-arrow view-option" +
            (isReportsOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsReportsOpen(!isReportsOpen);
            }}
          >
            <div className="collapse-title-container">
              <img src={reportsIcon} alt="reports-icon" />
              <div className="collapse-title-text">
                <div className="collapse-title-text-1">
                  <div className="collapse-title-text-1">
                    Reporte und Lage Exposé
                    {/*<span*/}
                    {/*  className={`badge ${*/}
                    {/*    isReportsOpen ? "badge-accent" : "badge-primary"*/}
                    {/*  }`}*/}
                    {/*>*/}
                    {/*  NEU*/}
                    {/*</span>*/}
                  </div>
                </div>
                <div className="collapse-title-text-2">
                  Für Zahlen, Daten & Fakten zur Lage
                </div>
              </div>
            </div>
          </div>
          <div className="collapse-content">
            <LocationExport />
          </div>
        </div>

        {hasOpenAiFeature && (
          <div
            className={
              "collapse collapse-arrow view-option" +
              (isAiDescriptionOpen ? " collapse-open" : " collapse-closed")
            }
          >
            <div
              className="collapse-title"
              ref={(node) => {
                setBackgroundColor(node, backgroundColor);
              }}
              onClick={() => {
                setIsAiDescriptionOpen(!isAiDescriptionOpen);
              }}
            >
              <div className="collapse-title-container">
                <img src={aiDescriptionIcon} alt="ai-description-icon" />
                <div className="collapse-title-text">
                  <div className="collapse-title-text-1">
                    Automatische Texte (KI)
                  </div>
                  <div className="collapse-title-text-2">
                    Für Inspiration aus der magischen Feder
                  </div>
                </div>
              </div>
            </div>
            <div className="collapse-content">
              <ul>
                {/* Could be needed in future */}
                {/*<li>*/}
                {/*  <h3*/}
                {/*    className="max-w-fit items-center cursor-pointer"*/}
                {/*    onClick={() => {*/}
                {/*      setOpenAiQueryType(undefined);*/}
                {/*      setIsShownOpenAiModal(true);*/}
                {/*    }}*/}
                {/*  >*/}
                {/*    <img*/}
                {/*      className="w-6 h-6"*/}
                {/*      style={invertFilter}*/}
                {/*      src={aiIcon}*/}
                {/*      alt="ai"*/}
                {/*    />*/}
                {/*    Lagetext generieren*/}
                {/*  </h3>*/}
                {/*</li>*/}
                {openAiQueryTypes.map(({ type, sidebarLabel }) => (
                  <li key={type}>
                    <h3
                      className="max-w-fit items-center cursor-pointer"
                      onClick={() => {
                        setOpenAiQueryType(type);
                        setIsShownOpenAiModal(true);
                      }}
                    >
                      <img
                        className="w-6 h-6"
                        style={invertFilter}
                        src={aiIcon}
                        alt="ai"
                      />
                      <span>{sidebarLabel}</span>
                    </h3>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TODO waits for the customer */}
        {/*<div*/}
        {/*  className={*/}
        {/*    "collapse collapse-arrow view-option" +*/}
        {/*    (isCustomerLinksOpen ? " collapse-open" : " collapse-closed")*/}
        {/*  }*/}
        {/*>*/}
        {/*  <div*/}
        {/*    className="collapse-title"*/}
        {/*    ref={(node) => {*/}
        {/*      setBackgroundColor(node, backgroundColor);*/}
        {/*    }}*/}
        {/*    onClick={() => {*/}
        {/*      setIsCustomerLinksOpen(!isCustomerLinksOpen);*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <div className="collapse-title-container">*/}
        {/*      <img src={webLinkIcon} alt="customer-links-icon" />*/}
        {/*      <div className="collapse-title-text">*/}
        {/*        <div className="collapse-title-text-1">Eigene Links</div>*/}
        {/*        <div className="collapse-title-text-2">*/}
        {/*          Hyperlinks zu externen Quellen oder Diensten*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*  <div className="collapse-content">*/}
        {/*    <div*/}
        {/*      className="text-justify"*/}
        {/*      style={{*/}
        {/*        padding:*/}
        {/*          "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",*/}
        {/*      }}*/}
        {/*    >*/}
        {/*      Hier könnten Sie Ihre Links speichern und mit KollegInnen teilen.*/}
        {/*      Sprechen Sie uns für diese Funktion gerne an.*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/* TODO waits for the customer */}
        <div
          className={
            "collapse collapse-arrow view-option" +
            (isCustomerDataOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsCustomerDataOpen(!isCustomerDataOpen);
            }}
          >
            <div className="collapse-title-container">
              <img src={fileIcon} alt="customer-data-icon" />
              <div className="collapse-title-text">
                <div className="collapse-title-text-1">Eigene Dateien</div>
                <div className="collapse-title-text-2">
                  Dateien und Objekt speichern, Zielgruppe anlegen
                </div>
              </div>
            </div>
          </div>
          <div className="collapse-content">
            <ul>
              <li>
                <h3
                  className="max-w-fit items-center cursor-pointer"
                  onClick={() => {
                    if (!searchContextState.localityParams.length) {
                      toastSuccess("Wird geladen ... bitte erneut klicken.");
                      return;
                    }

                    window.localStorage.setItem(
                      localStorageSearchContext,
                      JSON.stringify(searchContextState)
                    );

                    window.open("/potential-customers/from-result");
                  }}
                >
                  <img className="w-6 h-6" src={editIcon} alt="pdf" />
                  Zielgruppe speichern
                </h3>
              </li>
              <li>
                <h3
                  className="max-w-fit items-center cursor-pointer"
                  onClick={() => {
                    if (!searchContextState.placesLocation?.label) {
                      toastSuccess("Wird geladen ... bitte erneut klicken.");
                      return;
                    }

                    window.localStorage.setItem(
                      localStorageSearchContext,
                      JSON.stringify(searchContextState)
                    );

                    window.open("/real-estates/from-result");
                  }}
                >
                  <img className="w-6 h-6" src={editIcon} alt="pdf" />
                  Objekt anlegen
                </h3>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {exportType && exportType !== ExportTypeEnum.ONE_PAGE && (
        <ExportModal
          activeMeans={searchContextState.responseActiveMeans}
          entities={resultingGroups}
          groupedEntries={entityGroups}
          censusData={searchContextState.censusData!}
          snapshotToken={searchContextState.responseToken}
          exportType={exportType}
        />
      )}

      {exportType === ExportTypeEnum.ONE_PAGE && (
        <OnePageExportModal
          entityGroups={entityGroups}
          snapshotToken={searchContextState.responseToken}
          snapshotId={snapshotId}
          hasOpenAiFeature={hasOpenAiFeature}
        />
      )}
    </>
  );
};

export default ExportTab;
