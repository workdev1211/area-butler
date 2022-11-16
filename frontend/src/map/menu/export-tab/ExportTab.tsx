import { CSSProperties, FunctionComponent, useContext, useState } from "react";
import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";

import "./ExportTab.scss";
import { IExportTabProps } from "components/SearchResultContainer";
import {
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
import copyIcon from "../../../assets/icons/copy.svg";
import downloadIcon from "../../../assets/icons/download.svg";
import mapScreenshotsIcon from "../../../assets/icons/map-menu/07-kartenausschnitte.svg";
import digitalMediaIcon from "../../../assets/icons/map-menu/08-digitale-medien.svg";
import reportsIcon from "../../../assets/icons/map-menu/09-reporte.svg";
import aiDescriptionIcon from "../../../assets/icons/map-menu/10-ki-lagetexte.svg";

const invertFilter: CSSProperties = { filter: "invert(100%)" };

const ExportTab: FunctionComponent<IExportTabProps> = ({
  clippings,
  codeSnippet,
  config,
  directLink,
  placeLabel,
  snapshotId,
  hasOpenAiFeature = false,
}) => {
  const { searchContextDispatch } = useContext(SearchContext);

  const [isShownAiDescriptionModal, setIsShownAiDescriptionModal] =
    useState(false);
  const [isMapScreenshotsOpen, setIsMapScreenshotsOpen] = useState(false);
  const [isDigitalMediaOpen, setIsDigitalMediaOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAiDescriptionOpen, setIsAiDescriptionOpen] = useState(false);

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  // TODO think about moving the export modals from snippet editor to the current component
  // TODO add checks for the expose printing, etc, etc from the Snippet Editor component
  return (
    <div className="export-tab z-9000">
      {hasOpenAiFeature && (
        <OpenAiLocationDescriptionModal
          isShownModal={isShownAiDescriptionModal}
          closeModal={() => {
            setIsShownAiDescriptionModal(false);
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
                Für Exposés, Print Medien, Bilder Galerien
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
                <img className="w-6 h-6 invert" src={pdfIcon} alt="download" />
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
              <div className="collapse-title-text-1">Reporte</div>
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
                  searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
                    payload: true,
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
                  searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
                    payload: true,
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
                  searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
                    payload: true,
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
                    setIsShownAiDescriptionModal(true);
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
    </div>
  );
};

export default ExportTab;
