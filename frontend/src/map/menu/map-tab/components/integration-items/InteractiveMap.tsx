import { FunctionComponent, useContext, useState } from "react";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import {
  createCodeSnippet,
  setBackgroundColor,
  toastError,
  toastSuccess,
} from "../../../../../shared/shared.functions";
import mapIcon from "../../../../../assets/icons/map.svg";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../../context/SearchContext";
import ConfirmationModal from "../../../../../components/ConfirmationModal";
import {
  UserActionTypes,
  UserContext,
} from "../../../../../context/UserContext";
import { ConfigContext } from "../../../../../context/ConfigContext";
import { useHttp } from "../../../../../hooks/http";
import { OnOfficeIntActTypesEnum } from "../../../../../../../shared/types/on-office";
import { useIntegrationTools } from "../../../../../hooks/integrationtools";
import { useTools } from "../../../../../hooks/tools";
import copyIcon from "../../../../../assets/icons/copy.svg";
import { saveAs } from "file-saver";
import { getQrCodeBase64 } from "../../../../../export/QrCode";
import downloadIcon from "../../../../../assets/icons/download.svg";

dayjs.extend(utc);
dayjs.extend(timezone);

interface IInteractiveMapProps {
  searchAddress: string;
}

const InteractiveMap: FunctionComponent<IInteractiveMapProps> = ({
  searchAddress,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const { userDispatch } = useContext(UserContext);
  const {
    searchContextState: {
      integrationSnapshotId,
      integrationIframeEndsAt,
      responseToken,
      responseConfig: config,
    },
    searchContextDispatch,
  } = useContext(SearchContext);

  const { post } = useHttp();
  const { sendToProductsIfNoContingent } = useIntegrationTools();
  const { createDirectLink } = useTools();

  const [isInteractiveMapOpen, setIsInteractiveMapOpen] = useState(false);
  const [isShownModal, setIsShownModal] = useState(false);

  const directLink = createDirectLink(responseToken);
  const isIntegrationIframeExpired = integrationIframeEndsAt
    ? dayjs().isAfter(integrationIframeEndsAt)
    : true;

  const copyToClipboard = (text: string) => {
    const success = copy(text);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const handleUnlockIframe = async () => {
    try {
      const iframeEndsAt = (
        await post<Date>(
          `/api/location-integration/unlock-iframe/${integrationSnapshotId}`
        )
      ).data;

      userDispatch({
        type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
        payload: {
          integrationType: integrationType!,
          actionType: OnOfficeIntActTypesEnum.UNLOCK_IFRAME,
        },
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_INTEGRATION_IFRAME_ENDS_AT,
        payload: iframeEndsAt,
      });

      toastSuccess("Das Produkt wurde erfolgreich gekauft!");
      setIsShownModal(false);
    } catch (e) {
      toastError("Der Fehler ist aufgetreten!");
      console.error(e);
    }
  };

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isInteractiveMapOpen ? " collapse-open" : " collapse-closed")
      }
    >
      {isShownModal && (
        <ConfirmationModal
          closeModal={() => {
            setIsShownModal(false);
          }}
          onConfirm={handleUnlockIframe}
          text="Interaktive Karte freischalten?"
        />
      )}

      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsInteractiveMapOpen(!isInteractiveMapOpen);
        }}
        data-tour="publish-iframe"
      >
        <div className="collapse-title-container">
          <img src={mapIcon} alt="map-screenshots-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">Interaktive Karte</div>
            <div className="collapse-title-text-2">
              Für Ihre Webseite, print Medien, interaktive Exposés oder für die
              direktere Kundenbetreuung
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        <div
          className="flex flex-col gap-5"
          style={{
            padding:
              "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
          }}
        >
          <button
            className="btn btn-xs btn-primary w-1/2"
            style={{
              padding: "0.25rem",
              height: "calc(var(--btn-height) / 1.5)",
            }}
            onClick={() => {
              if (!sendToProductsIfNoContingent()) {
                setIsShownModal(true);
              }
            }}
          >
            Veröffentlichen
          </button>

          {integrationIframeEndsAt && (
            <div className="text-justify">
              Die interaktive Karte wird bis zum "
              {dayjs(integrationIframeEndsAt)
                .tz("Europe/Berlin")
                .format("DD-MM-YYYY HH:mm")}{" "}
              (purchase + 6 months)" für Sie online gehosted. Verlängerung ist
              möglich, sprechen Sie uns gerne an.
            </div>
          )}

          {!isIntegrationIframeExpired && (
            <>
              <div>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    copyToClipboard(directLink);
                  }}
                >
                  <img className="w-6 h-6" src={copyIcon} alt="copy" />
                  Direktlink kopieren
                </h3>
              </div>

              <div>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    copyToClipboard(createCodeSnippet(responseToken));
                  }}
                >
                  <img className="w-6 h-6" src={copyIcon} alt="copy" />
                  iFrame / Widget kopieren
                </h3>
              </div>

              <div>
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={async () => {
                    const qrCodeLabel = searchAddress || "AreaButler";

                    saveAs(
                      await getQrCodeBase64(directLink),
                      `${qrCodeLabel.replace(/[\s|,]+/g, "-")}-QR-Code.png`
                    );
                  }}
                >
                  <img
                    className="w-6 h-6"
                    src={downloadIcon}
                    alt="download-qr-code"
                  />
                  QR-Code herunterladen
                </h3>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
