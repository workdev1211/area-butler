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
import { copyTextToClipboard } from "../../../../shared/shared.functions";
import { ConfigContext } from "../../../../context/ConfigContext";
import { useIntegrationTools } from "../../../../hooks/integrationtools";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import UnlockProduct from "../../components/UnlockProduct";

interface IDigitalMediaProps {
  codeSnippet: string;
  directLink: string;
  searchAddress: string;
}

const DigitalMedia: FunctionComponent<IDigitalMediaProps> = ({
  codeSnippet,
  directLink,
  searchAddress,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
    searchContextDispatch,
  } = useContext(SearchContext);

  const { sendToOnOffice, unlockProduct } = useIntegrationTools();

  const [isShownConfirmModal, setIsShownConfirmModal] = useState(false);

  const isIntegrationIframeExpired = integrationType
    ? !!(
        realEstateListing?.iframeEndsAt &&
        dayjs().isAfter(realEstateListing.iframeEndsAt)
      )
    : false;

  if (isIntegrationIframeExpired) {
    return (
      <>
        {isShownConfirmModal && (
          <ConfirmationModal
            closeModal={() => {
              setIsShownConfirmModal(false);
            }}
            onConfirm={async () => {
              await unlockProduct(OnOfficeIntActTypesEnum.UNLOCK_IFRAME);
            }}
            text="Interaktive Karte freischalten?"
          />
        )}

        <UnlockProduct
          performUnlock={() => {
            setIsShownConfirmModal(true);
          }}
        />
      </>
    );
  }

  return (
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
  );
};

export default DigitalMedia;
