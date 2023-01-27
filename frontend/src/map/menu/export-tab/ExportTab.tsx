import {
  CSSProperties,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";

import "./ExportTab.scss";
import { IExportTabProps } from "components/SearchResultContainer";
import {
  deriveEntityGroupsByActiveMeans,
  setBackgroundColor,
  toastSuccess,
} from "../../../shared/shared.functions";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../context/SearchContext";
import { getQrCodeBase64 } from "../../../export/QrCode";
import OpenAiLocationDescriptionModal from "../../../components/OpenAiLocationDescriptionModal";
import MapClippingsCollapsable from "../clippings/MapClippingsCollapsable";
import aiIcon from "../../../assets/icons/ai-big.svg";
import pdfIcon from "../../../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import editIcon from "../../../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import copyIcon from "../../../assets/icons/copy.svg";
import downloadIcon from "../../../assets/icons/download.svg";
import mapScreenshotsIcon from "../../../assets/icons/map-menu/07-kartenausschnitte.svg";
import digitalMediaIcon from "../../../assets/icons/map-menu/08-digitale-medien.svg";
import reportsIcon from "../../../assets/icons/map-menu/09-reporte.svg";
import aiDescriptionIcon from "../../../assets/icons/map-menu/10-ki-lagetexte.svg";
// TODO start - waits for the customer
import webLinkIcon from "../../../assets/icons/link.svg";
import fileIcon from "../../../assets/icons/file.svg";
// TODO end
import { UserActionTypes, UserContext } from "../../../context/UserContext";
import ExportModal, { ExportTypeEnum } from "../../../export/ExportModal";
import OnePageExportModal from "../../../export/one-page/OnePageExportModal";
import { localStorageSearchContext } from "../../../../../shared/constants/constants";

const subscriptionUpgradeFullyCustomizableExpose =
  "Das vollständig konfigurierbare Expose als Docx ist im aktuellen Abonnement nicht enthalten.";

const invertFilter: CSSProperties = { filter: "invert(100%)" };

const ExportTab: FunctionComponent<IExportTabProps> = ({
  codeSnippet,
  directLink,
  placeLabel,
  snapshotId,
}) => {
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userState, userDispatch } = useContext(UserContext);

  const [exportType, setExportType] = useState<ExportTypeEnum | undefined>();
  const [isShownOpenAiLocationModal, setIsShownOpenAiLocationModal] =
    useState(false);
  const [isMapScreenshotsOpen, setIsMapScreenshotsOpen] = useState(false);
  const [isDigitalMediaOpen, setIsDigitalMediaOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAiDescriptionOpen, setIsAiDescriptionOpen] = useState(false);
  // TODO waits for the customer
  const [isCustomerLinksOpen, setIsCustomerLinksOpen] = useState(false);
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
  const config = searchContextState.responseConfig;

  const groupedEntities = deriveEntityGroupsByActiveMeans(
    searchContextState.responseGroupedEntities,
    searchContextState.responseActiveMeans
  );

  const resultingEntities = groupedEntities.map((g) => g.items).flat();

  const user = userState.user;
  const hasOpenAiFeature = !!user?.subscription?.config.appFeatures.openAi;
  const hasFullyCustomizableExpose =
    !!user?.subscription?.config.appFeatures.fullyCustomizableExpose;

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  return (
    <>
      <div className="export-tab z-9000">
        {hasOpenAiFeature && isShownOpenAiLocationModal && (
          <OpenAiLocationDescriptionModal
            isShownModal={isShownOpenAiLocationModal}
            closeModal={() => {
              setIsShownOpenAiLocationModal(false);
            }}
            searchResultSnapshotId={snapshotId}
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
                searchAddress={placeLabel}
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
            <ul>
              <li>
                <h3
                  // TODO move to the ExportTab.scss file
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    copyCodeToClipBoard(directLink);
                  }}
                >
                  <img className="w-6 h-6" src={copyIcon} alt="copy" />
                  Hyperlink zur Vollbild-Karte URL
                </h3>
              </li>
              <li>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={async () => {
                    saveAs(
                      await getQrCodeBase64(directLink),
                      `${placeLabel.replace(/[\s|,]+/g, "-")}-QR-Code.png`
                    );
                  }}
                >
                  <img className="w-6 h-6" src={downloadIcon} alt="download" />
                  QR Code
                </h3>
              </li>
              <li>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    searchContextDispatch({
                      type: SearchContextActionTypes.SET_PRINTING_ZIP_ACTIVE,
                      payload: true,
                    });
                  }}
                >
                  <img
                    className="w-6 h-6 invert"
                    src={pdfIcon}
                    alt="download"
                  />
                  Export Kartenlegende ZIP
                </h3>
              </li>
              <li>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    copyCodeToClipBoard(codeSnippet);
                  }}
                >
                  <img className="w-6 h-6" src={copyIcon} alt="copy" />
                  Snippet (iFrame) HTML
                </h3>
              </li>
            </ul>
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
                  Reporte und Lage Exposé
                </div>
                <div className="collapse-title-text-2">
                  Für Zahlen, Daten & Fakten zur Lage
                </div>
              </div>
            </div>
          </div>
          <div className="collapse-content">
            <ul>
              <li>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    hasFullyCustomizableExpose
                      ? searchContextDispatch({
                          type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
                          payload: true,
                        })
                      : userDispatch({
                          type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                          payload: {
                            open: true,
                            message: subscriptionUpgradeFullyCustomizableExpose,
                          },
                        });
                  }}
                >
                  <img
                    className="w-6 h-6"
                    style={invertFilter}
                    src={pdfIcon}
                    alt="pdf"
                  />
                  Umfeldanalyse PDF
                </h3>
              </li>
              <li>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    hasFullyCustomizableExpose
                      ? searchContextDispatch({
                          type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
                          payload: true,
                        })
                      : userDispatch({
                          type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                          payload: {
                            open: true,
                            message: subscriptionUpgradeFullyCustomizableExpose,
                          },
                        });
                  }}
                >
                  <img
                    className="w-6 h-6"
                    style={invertFilter}
                    src={pdfIcon}
                    alt="pdf"
                  />
                  Umfeldanalyse DOC
                </h3>
              </li>
              <li>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    hasFullyCustomizableExpose
                      ? searchContextDispatch({
                          type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
                          payload: true,
                        })
                      : userDispatch({
                          type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                          payload: {
                            open: true,
                            message: subscriptionUpgradeFullyCustomizableExpose,
                          },
                        });
                  }}
                >
                  <img
                    className="w-6 h-6"
                    style={invertFilter}
                    src={pdfIcon}
                    alt="pdf"
                  />
                  Überblick PDF
                </h3>
              </li>
              <li>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    hasFullyCustomizableExpose
                      ? searchContextDispatch({
                          type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
                          payload: true,
                        })
                      : userDispatch({
                          type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                          payload: {
                            open: true,
                            message: subscriptionUpgradeFullyCustomizableExpose,
                          },
                        });
                  }}
                >
                  <img
                    className="w-6 h-6"
                    style={invertFilter}
                    src={pdfIcon}
                    alt="pdf"
                  />
                  Lage Exposé generieren
                </h3>
              </li>
            </ul>
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
                  <div className="collapse-title-text-1">KI-Lagetexte</div>
                  <div className="collapse-title-text-2">
                    Für originelle Texte aus der magischen Feder
                  </div>
                </div>
              </div>
            </div>
            <div className="collapse-content">
              <ul>
                <li>
                  <h3
                    className="flex max-w-fit items-center cursor-pointer gap-2"
                    onClick={() => {
                      setIsShownOpenAiLocationModal(true);
                    }}
                  >
                    <img
                      className="w-6 h-6"
                      style={invertFilter}
                      src={aiIcon}
                      alt="ai"
                    />
                    Lagetext generieren
                  </h3>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TODO waits for the customer */}
        <div
          className={
            "collapse collapse-arrow view-option" +
            (isCustomerLinksOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsCustomerLinksOpen(!isCustomerLinksOpen);
            }}
          >
            <div className="collapse-title-container">
              <img src={webLinkIcon} alt="customer-links-icon" />
              <div className="collapse-title-text">
                <div className="collapse-title-text-1">Eigene Links</div>
                <div className="collapse-title-text-2">
                  Hyperlinks zu externen Quellen oder Diensten
                </div>
              </div>
            </div>
          </div>
          <div className="collapse-content">
            <div
              className="text-justify"
              style={{
                padding:
                  "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
              }}
            >
              Hier könnten Sie Ihre Links speichern und mit KollegInnen teilen.
              Sprechen Sie uns für diese Funktion gerne an.
            </div>
          </div>
        </div>

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
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    if (!searchContextState.localityParams.length) {
                      toastSuccess("Wird geladen...");
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
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    if (!searchContextState.placesLocation.label) {
                      toastSuccess("Wird geladen...");
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
          entities={resultingEntities}
          groupedEntries={groupedEntities}
          censusData={searchContextState.censusData!}
          snapshotToken={searchContextState.responseToken}
          exportType={exportType}
        />
      )}

      {exportType === ExportTypeEnum.ONE_PAGE && (
        <OnePageExportModal
          groupedEntries={groupedEntities}
          snapshotToken={searchContextState.responseToken}
          snapshotId={snapshotId}
          primaryColor={config?.primaryColor}
          hasOpenAiFeature={hasOpenAiFeature}
        />
      )}
    </>
  );
};

export default ExportTab;
