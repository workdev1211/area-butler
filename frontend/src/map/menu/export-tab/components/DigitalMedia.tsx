import { FunctionComponent, useContext, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import JsZip from "jszip";
import dayjs from "dayjs";

import "./DigitalMedia.scss";

import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../context/SearchContext";
import { OnOfficeIntActTypesEnum } from "../../../../../../shared/types/on-office";
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
  deriveEntityGroupsByActiveMeans,
  sanitizeFilename,
  setBackgroundColor,
} from "../../../../shared/shared.functions";
import { useIntegrationTools } from "../../../../hooks/integrationtools";
import digitalMediaIcon from "../../../../assets/icons/map-menu/08-digitale-medien.svg";
import { TUnlockIntProduct } from "../../../../../../shared/types/integration";
import { AreaButlerExportTypesEnum } from "../../../../../../shared/types/integration-user";
import { UserContext } from "../../../../context/UserContext";
import UnlockProductButton from "../../components/UnlockProductButton";
import { EntityGroup } from "../../../../shared/search-result.types";
import { getFilteredLegend } from "../../../../export/shared/shared.functions";
import { getRenderedLegend } from "../../../../export/RenderedLegend";
import { realEstateListingsTitle } from "../../../../../../shared/constants/real-estate";

interface IDigitalMediaProps {
  codeSnippet: string;
  directLink: string;
  searchAddress: string;
  backgroundColor: string;
  performUnlock?: TUnlockIntProduct;
}

const DigitalMedia: FunctionComponent<IDigitalMediaProps> = ({
  codeSnippet,
  directLink,
  searchAddress,
  backgroundColor,
  performUnlock,
}) => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const {
    searchContextState: {
      realEstateListing,
      responseConfig,
      responseGroupedEntities,
      responseActiveMeans,
      printingZipActive,
    },
    searchContextDispatch,
  } = useContext(SearchContext);

  const { sendToOnOffice } = useIntegrationTools();
  const [isDigitalMediaOpen, setIsDigitalMediaOpen] = useState(false);

  useEffect(() => {
    if (!printingZipActive) {
      return;
    }

    const downloadZipArchive = async () => {
      const entityGroups = deriveEntityGroupsByActiveMeans(
        responseGroupedEntities,
        responseActiveMeans
      ).filter(
        ({ title, items }: EntityGroup) =>
          title !== realEstateListingsTitle && items.length > 0
      );

      const legend = getFilteredLegend(entityGroups);
      const zip = new JsZip();

      (await getRenderedLegend(legend)).forEach(({ title, icon }) => {
        zip.file(`icons/${sanitizeFilename(title)}.png`, icon, {
          base64: true,
        });
      });

      const archive = await zip.generateAsync({ type: "blob" });
      saveAs(archive, "AreaButler-Icons.zip");

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PRINTING_ZIP_ACTIVE,
        payload: false,
      });
    };

    void downloadZipArchive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printingZipActive, responseActiveMeans, responseGroupedEntities]);

  const handleUnlock = (): void => {
    if (performUnlock) {
      performUnlock(
        "Interaktive Karte freischalten?",
        OnOfficeIntActTypesEnum.UNLOCK_IFRAME
      );
    }
  };

  const getIntUserLinkExpType = (): AreaButlerExportTypesEnum | undefined => {
    if (integrationUser?.config.isFileLink) {
      return responseConfig?.showAddress
        ? AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS
        : AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS;
    }

    if (integrationUser?.config?.exportMatching) {
      if (
        responseConfig?.showAddress &&
        integrationUser.config.exportMatching[
          AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS
        ]
      ) {
        return AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS;
      }

      if (
        !responseConfig?.showAddress &&
        integrationUser.config.exportMatching[
          AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS
        ]
      ) {
        return AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS;
      }
    }

    return responseConfig?.showAddress
      ? AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS
      : AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS;
  };

  const isNotIntOrNotExpForIntUser =
    !integrationUser ||
    (!!realEstateListing?.iframeEndsAt &&
      !dayjs().isAfter(realEstateListing?.iframeEndsAt));

  const isIntUserIframeExportAvail = !!(
    integrationUser?.config.exportMatching &&
    integrationUser?.config.exportMatching[
      AreaButlerExportTypesEnum.INLINE_FRAME
    ]
  );

  const intUserLinkExpType = getIntUserLinkExpType();

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
        {isNotIntOrNotExpForIntUser ? (
          <div className="digital-media">
            {/* Embedded snapshot url */}

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
              {!!intUserLinkExpType && (
                <div
                  onClick={() => {
                    if (!integrationUser?.config.isFileLink) {
                      void sendToOnOffice({
                        exportType: intUserLinkExpType!,
                        text: directLink,
                      });

                      return;
                    }

                    const fileTitle =
                      intUserLinkExpType ===
                      AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS
                        ? "Anonym - AreaButler Link ohne Adresse"
                        : "Mit Adresse - AreaButler Link";

                    void sendToOnOffice({
                      fileTitle,
                      exportType: intUserLinkExpType!,
                      url: directLink,
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
              {integrationUser && (
                <div
                  onClick={async () => {
                    void sendToOnOffice({
                      exportType: AreaButlerExportTypesEnum.QR_CODE,
                      filename: `${searchAddress.replace(
                        /[\s|,]+/g,
                        "-"
                      )}-QR-Code.png`,
                      base64Content: (
                        await getQrCodeBase64(directLink)
                      ).replace(/^data:.*;base64,/, ""),
                      fileTitle: "QR-Code",
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
              {isIntUserIframeExportAvail && (
                <div
                  onClick={() => {
                    void sendToOnOffice({
                      exportType: AreaButlerExportTypesEnum.INLINE_FRAME,
                      text: codeSnippet,
                    });
                  }}
                >
                  <img src={sendToOnOfficeIcon} alt="send-to-on-office" />
                  <span>onOffice</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <UnlockProductButton performUnlock={handleUnlock} />
        )}
      </div>
    </div>
  );
};

export default DigitalMedia;
