import { FunctionComponent, useContext, useState } from "react";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

import "./DigitalMedia.scss";

import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../context/SearchContext";
import {
  ApiOnOfficeArtTypesEnum,
  OnOfficeIntActTypesEnum,
} from "../../../../../../shared/types/on-office";
import sendToOnOfficeIcon from "../../../../assets/icons/entrance-alt1.svg";
import { getQrCodeBase64 } from "../../../../export/QrCode";
import copyIcon from "../../../../assets/icons/copy.svg";
import downloadIcon from "../../../../assets/icons/download.svg";
import urlIcon from "../../../../assets/icons/link.svg";
import qrCodeIcon from "../../../../assets/icons/map-menu/editor-tab/qr-code.svg";
import legendIcon from "../../../../assets/icons/map-menu/editor-tab/legend-icons.svg";
import iframeIcon from "../../../../assets/icons/map-menu/editor-tab/iframe.svg";
import {
  copyTextToClipboard,
  setBackgroundColor,
} from "../../../../shared/shared.functions";
import { ConfigContext } from "../../../../context/ConfigContext";
import { useIntegrationTools } from "../../../../hooks/integrationtools";
import UnlockProduct from "../../components/UnlockProduct";
import digitalMediaIcon from "../../../../assets/icons/map-menu/08-digitale-medien.svg";
import { TUnlockIntProduct } from "../../../../../../shared/types/integration";

interface IDigitalMediaProps {
  codeSnippet: string;
  directLink: string;
  searchAddress: string;
  backgroundColor: string;
  performUnlock: TUnlockIntProduct;
}

const DigitalMedia: FunctionComponent<IDigitalMediaProps> = ({
  codeSnippet,
  directLink,
  searchAddress,
  backgroundColor,
  performUnlock,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
    searchContextDispatch,
  } = useContext(SearchContext);

  const { sendToOnOffice } = useIntegrationTools();
  const [isDigitalMediaOpen, setIsDigitalMediaOpen] = useState(false);

  const isIntegrationIframeExpired = integrationType
    ? realEstateListing?.iframeEndsAt
      ? dayjs().isAfter(realEstateListing.iframeEndsAt)
      : true
    : false;

  const handleUnlock = (): void => {
    performUnlock(
      "Interaktive Karte freischalten?",
      OnOfficeIntActTypesEnum.UNLOCK_IFRAME
    );
  };

  return (
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
        {!isIntegrationIframeExpired ? (
          <div className="digital-media">
            {/* iFrame url */}

            <div>
              <div>
                <img src={urlIcon} alt="iframe-url" />
                <span>Öffentlicher Link</span>
              </div>
              <div
                onClick={() => {
                  copyTextToClipboard(directLink);
                }}
              >
                <img src={copyIcon} alt="copy" />
                <span>Kopieren</span>
              </div>
              {integrationType && (
                <div
                  onClick={async (): Promise<void> => {
                    await sendToOnOffice({
                      fileTitle: "iFrame Direktlink",
                      url: directLink,
                      artType: ApiOnOfficeArtTypesEnum.LINK,
                    });
                  }}
                >
                  <img src={sendToOnOfficeIcon} alt="send-to-on-office" />
                  <span>onOffice</span>
                </div>
              )}
            </div>

            {/* QR-code */}

            <div>
              <div>
                <img src={qrCodeIcon} alt="url-link" />
                <span>QR-Code Link</span>
              </div>
              <div
                onClick={async () => {
                  saveAs(
                    await getQrCodeBase64(directLink),
                    `${searchAddress.replace(/[\s|,]+/g, "-")}-QR-Code.png`
                  );
                }}
              >
                <img src={downloadIcon} alt="download-qr-code" />
                <span>Herunterladen</span>
              </div>
              {integrationType && (
                <div
                  onClick={async () => {
                    await sendToOnOffice({
                      filename: `${searchAddress.replace(
                        /[\s|,]+/g,
                        "-"
                      )}-QR-Code.png`,
                      base64Content: (
                        await getQrCodeBase64(directLink)
                      ).replace(/^data:.*;base64,/, ""),
                      fileTitle: "QR-Code",
                      artType: ApiOnOfficeArtTypesEnum["QR-CODE"],
                    });
                  }}
                >
                  <img src={sendToOnOfficeIcon} alt="send-to-on-office" />
                  <span>onOffice</span>
                </div>
              )}
            </div>

            {/* POI legend icons */}

            <div>
              <div>
                <img src={legendIcon} alt="download-legend" />
                <span>Legende POI Icons</span>
              </div>
              <div
                onClick={() => {
                  searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_ZIP_ACTIVE,
                    payload: true,
                  });
                }}
              >
                <img src={downloadIcon} alt="download-qr-code" />
                <span>Herunterladen</span>
              </div>
            </div>

            {/* iFrame */}

            <div>
              <div>
                <img src={iframeIcon} alt="iframe" />
                <span>iFrame für Website</span>
              </div>
              <div
                onClick={() => {
                  copyTextToClipboard(codeSnippet);
                }}
              >
                <img src={copyIcon} alt="copy-iframe" />
                <span>Kopieren</span>
              </div>
              {/* TODO will be added in future */}
              {/*{isIntegration && (*/}
              {/*  <div onClick={async () => {}}>*/}
              {/*    <img src={sendToOnOfficeIcon} alt="send-to-on-office" />*/}
              {/*    <span>onOffice</span>*/}
              {/*  </div>*/}
              {/*)}*/}
            </div>
          </div>
        ) : (
          <UnlockProduct performUnlock={handleUnlock} />
        )}
      </div>
    </div>
  );
};

export default DigitalMedia;
