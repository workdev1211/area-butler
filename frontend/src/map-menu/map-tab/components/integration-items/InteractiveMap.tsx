// TODO REMOVE IN THE FUTURE

import { FunctionComponent, useContext, useState } from "react";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import {
  setBackgroundColor,
  toastError,
  toastSuccess,
} from "../../../../shared/shared.functions";
import mapIcon from "../../../../assets/icons/map.svg";
import { SearchContext } from "../../../../context/SearchContext";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { UserContext } from "../../../../context/UserContext";
import { ConfigContext } from "../../../../context/ConfigContext";
import { useHttp } from "../../../../hooks/http";
import { useTools } from "../../../../hooks/tools";

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
      snapshotId,
      // integrationIframeEndsAt,
      responseConfig: config,
    },
    searchContextDispatch,
  } = useContext(SearchContext);

  const { post } = useHttp();
  // const { checkProdContAvailByAction, sendToOnOffice } = useIntegrationTools();
  const { createDirectLink, createCodeSnippet } = useTools();

  const [isInteractiveMapOpen, setIsInteractiveMapOpen] = useState(false);
  const [isShownModal, setIsShownModal] = useState(false);

  const directLink = createDirectLink();
  // const isIntegrationIframeExpired = integrationIframeEndsAt
  //   ? dayjs().isAfter(integrationIframeEndsAt)
  //   : true;

  const copyToClipboard = (text: string) => {
    const success = copy(text);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const unlockIframe = async (): Promise<void> => {
    try {
      const iframeEndsAt = (
        await post<Date>(`/api/location-int/unlock-iframe/${snapshotId}`)
      ).data;

      // userDispatch({
      //   type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
      //   payload: {
      //     integrationType: integrationType!,
      //     actionType: OnOfficeIntActTypesEnum.UNLOCK_IFRAME,
      //   },
      // });

      // searchContextDispatch({
      //   type: SearchContextActionTypes.SET_INTEGRATION_IFRAME_ENDS_AT,
      //   payload: iframeEndsAt,
      // });

      toastSuccess("Die Adresse wurde erfolgreich freigeschaltet!");
      setIsShownModal(false);
    } catch (e) {
      toastError("Der Fehler ist aufgetreten!");
      console.error(e);
    }
  };

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  const qrCodeLabel = searchAddress
    ? searchAddress.replace(",", "-").replace(/\s/g, "")
    : "AreaButler";

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
          onConfirm={unlockIframe}
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
              // if (
              //   checkProdContAvailByAction(
              //     OnOfficeIntActTypesEnum.UNLOCK_IFRAME
              //   )
              // ) {
              //   setIsShownModal(true);
              // }
            }}
          >
            Veröffentlichen
          </button>

          {/*{integrationIframeEndsAt && (*/}
          {/*  <div className="text-justify">*/}
          {/*    Die interaktive Karte wird bis zum{" "}*/}
          {/*    {dayjs(integrationIframeEndsAt)*/}
          {/*      .tz("Europe/Berlin")*/}
          {/*      .format("DD-MM-YYYY HH:mm")}{" "}*/}
          {/*    für Sie online gehosted. Verlängerung ist möglich, sprechen Sie*/}
          {/*    uns gerne an.*/}
          {/*  </div>*/}
          {/*)}*/}

          {/*{!isIntegrationIframeExpired && (*/}
          {/*  <>*/}
          {/*    <div className="flex flex-col gap-2">*/}
          {/*      <div className="font-bold">Direktlink</div>*/}
          {/*      <div*/}
          {/*        className="flex items-center cursor-pointer gap-2 max-w-fit"*/}
          {/*        onClick={() => {*/}
          {/*          copyToClipboard(directLink);*/}
          {/*        }}*/}
          {/*      >*/}
          {/*        <img className="w-6 h-6" src={copyIcon} alt="copy" />*/}
          {/*        <span>Kopieren</span>*/}
          {/*      </div>*/}
          {/*      <div*/}
          {/*        className="flex items-center cursor-pointer gap-2 max-w-fit"*/}
          {/*        onClick={async () => {*/}
          {/*          await sendToOnOffice({*/}
          {/*            fileTitle: "iFrame Direktlink",*/}
          {/*            url: directLink,*/}
          {/*            artType: ApiOnOfficeArtTypesEnum.LINK,*/}
          {/*          });*/}
          {/*        }}*/}
          {/*      >*/}
          {/*        <img*/}
          {/*          className="w-6 h-6"*/}
          {/*          src={sendToOnOfficeIcon}*/}
          {/*          alt="send-to-on-office"*/}
          {/*        />*/}
          {/*        <span>An onOffice senden</span>*/}
          {/*      </div>*/}
          {/*    </div>*/}

          {/*    <div className="border-b-2 border-black" />*/}

          {/*    <div*/}
          {/*      className="flex max-w-fit items-center cursor-pointer gap-2"*/}
          {/*      onClick={() => {*/}
          {/*        copyToClipboard(createCodeSnippet(responseToken));*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      <img className="w-6 h-6" src={copyIcon} alt="copy" />*/}
          {/*      <span>iFrame / Widget kopieren</span>*/}
          {/*    </div>*/}

          {/*    <div className="border-b-2 border-black" />*/}

          {/*    <div className="flex flex-col gap-2">*/}
          {/*      <div className="font-bold">QR-Code</div>*/}
          {/*      <div*/}
          {/*        className="flex items-center cursor-pointer gap-2 max-w-fit"*/}
          {/*        onClick={async () => {*/}
          {/*          saveAs(*/}
          {/*            await getQrCodeBase64(directLink),*/}
          {/*            `${qrCodeLabel.replace(/[\s|,]+/g, "-")}-QR-Code.png`*/}
          {/*          );*/}
          {/*        }}*/}
          {/*      >*/}
          {/*        <img*/}
          {/*          className="w-6 h-6"*/}
          {/*          src={downloadIcon}*/}
          {/*          alt="download-qr-code"*/}
          {/*        />*/}
          {/*        <span>Herunterladen</span>*/}
          {/*      </div>*/}
          {/*      <div*/}
          {/*        className="flex items-center cursor-pointer gap-2 max-w-fit"*/}
          {/*        onClick={async () => {*/}
          {/*          await sendToOnOffice({*/}
          {/*            filename: `${qrCodeLabel.replace(*/}
          {/*              /[\s|,]+/g,*/}
          {/*              "-"*/}
          {/*            )}-QR-Code.png`,*/}
          {/*            base64Content: (*/}
          {/*              await getQrCodeBase64(directLink)*/}
          {/*            ).replace(/^data:.*;base64,/, ""),*/}
          {/*            fileTitle: "QR-Code",*/}
          {/*            artType: ApiOnOfficeArtTypesEnum["QR-CODE"],*/}
          {/*          });*/}
          {/*        }}*/}
          {/*      >*/}
          {/*        <img*/}
          {/*          className="w-6 h-6"*/}
          {/*          src={sendToOnOfficeIcon}*/}
          {/*          alt="send-to-on-office"*/}
          {/*        />*/}
          {/*        <span>An onOffice senden</span>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </>*/}
          {/*)}*/}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
