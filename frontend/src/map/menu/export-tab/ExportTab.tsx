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
import pdfIcon from "../../../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import { getQrCodeBase64 } from "../../../export/QrCode";
import aiIcon from "../../../assets/icons/ai-big.svg";
import OpenAiLocationDescriptionModal from "../../../components/OpenAiLocationDescriptionModal";
import copyIcon from "../../../assets/icons/copy.svg";
import downloadIcon from "../../../assets/icons/download.svg";
import screenshotIcon from "../../../assets/icons/screenshot.svg";

const invertFilter: CSSProperties = { filter: "invert(100%)" };

const ExportTab: FunctionComponent<IExportTabProps> = ({
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
  const [isDigitalMediaOpen, setIsDigitalMediaOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isTextAiOpen, setIsTextAiOpen] = useState(false);

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

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
          Digitale Medien
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
                  copyCodeToClipBoard(codeSnippet);
                }}
              >
                <img className="w-6 h-6" src={copyIcon} alt="copy" />
                Snippet (iFrame) HTML
              </h3>
            </li>
            <li>
              <h3
                className="flex max-w-fit items-center cursor-pointer gap-2"
                onClick={() => {
                  toastSuccess("Kartenausschnitte erstellen PNG");
                }}
              >
                <img
                  className="w-6 h-6"
                  src={screenshotIcon}
                  alt="screenshot"
                />
                Kartenausschnitte erstellen PNG
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
          Reporte
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
            (isTextAiOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsTextAiOpen(!isTextAiOpen);
            }}
          >
            KI-Lagetexte
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
