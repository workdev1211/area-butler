import { FC, useContext, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import JsZip from "jszip";
import { useTranslation } from "react-i18next";

import "./DigitalMedia.scss";

import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../context/SearchContext";
import sendToOnOfficeIcon from "../../../assets/icons/entrance-alt1.svg";
import { getQrCodeBase64 } from "../../../export/QrCode";
import copyIcon from "../../../assets/icons/copy.svg";
import downloadIcon from "../../../assets/icons/download.svg";
import qrCodeIcon from "../../../assets/icons/map-menu/editor-tab/qr-code.svg";
import legendIcon from "../../../assets/icons/map-menu/editor-tab/legend-icons.svg";
import iframeIcon from "../../../assets/icons/map-menu/editor-tab/iframe.svg";
import {
  copyTextToClipboard,
  sanitizeFilename,
  setBackgroundColor,
} from "../../../shared/shared.functions";
import { useIntegrationTools } from "../../../hooks/integration/integrationtools";
import digitalMediaIcon from "../../../assets/icons/map-menu/08-digitale-medien.svg";
import {
  IntegrationActionTypeEnum,
  TUnlockIntProduct,
} from "../../../../../shared/types/integration";
import UnlockProductButton from "../../components/UnlockProductButton";
import { EntityGroup } from "../../../shared/search-result.types";
import { getFilteredLegend } from "../../../export/shared/shared.functions";
import { getRenderedLegend } from "../../../export/RenderedLegend";
import { ConfigContext } from "../../../context/ConfigContext";
import { integrationNames } from "../../../../../shared/constants/integration";
import { useTools } from "../../../hooks/tools";
import {
  AreaButlerExportTypesEnum,
  FeatureTypeEnum,
  LanguageTypeEnum,
  OsmName,
} from "../../../../../shared/types/types";
import { IntlKeys } from "i18n/keys";
import PublicLinks from "./PublicLinks";

interface IDigitalMediaProps {
  searchAddress: string;
  backgroundColor: string;
  performUnlock?: TUnlockIntProduct;
}

const DigitalMedia: FC<IDigitalMediaProps> = ({
  searchAddress,
  backgroundColor,
  performUnlock,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: {
      entityGroupsByActMeans,
      printingZipActive,
      responseGroupedEntities,
      responseActiveMeans,
      responseConfig,
    },
    searchContextDispatch,
  } = useContext(SearchContext);

  const { t } = useTranslation();
  const { t: outputT } = useTranslation("", {
    lng: responseConfig?.language || LanguageTypeEnum.de,
  });
  const { sendToIntegration } = useIntegrationTools();
  const {
    checkIsFeatAvailable,
    createCodeSnippet,
    createDirectLink,
    getActualUser,
  } = useTools();

  const [isDigitalMediaOpen, setIsDigitalMediaOpen] = useState(false);

  const user = getActualUser();

  useEffect(() => {
    if (!printingZipActive) {
      return;
    }

    const downloadZipArchive = async (): Promise<void> => {
      const entityGroups = entityGroupsByActMeans.reduce((acc, group) => {
        if (group.name !== OsmName.property && group.items.length > 0) {
          acc.push({
            ...group,
            title: outputT(
              (
                IntlKeys.snapshotEditor.pointsOfInterest as Record<
                  string,
                  string
                >
              )[group.name]
            ),
          });
        }
        return acc;
      }, [] as EntityGroup[]);

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
        t(IntlKeys.snapshotEditor.dataTab.unlockInteractiveMap),
        IntegrationActionTypeEnum.UNLOCK_IFRAME
      );
    }
  };

  const isIframeAvailable = checkIsFeatAvailable(FeatureTypeEnum.IFRAME);

  const isIntUserIframeExportAvail = !!(
    user.config.exportMatching &&
    user.config.exportMatching[AreaButlerExportTypesEnum.INLINE_FRAME]
  );

  const codeSnippet = createCodeSnippet({ language: responseConfig?.language });
  const directLink = createDirectLink({
    language: responseConfig?.language,
  });

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
            <div className="collapse-title-text-1">
              {t(IntlKeys.snapshotEditor.dataTab.digitalMedia)}
            </div>
          </div>
        </div>
      </div>

      <div className="collapse-content">
        {isIframeAvailable ? (
          <div className="digital-media">
            {/* Embedded snapshot url */}

            <PublicLinks />

            {/* QR-code */}

            <div>
              <div>
                <img src={qrCodeIcon} alt="url-link" />
                <span>{t(IntlKeys.snapshotEditor.dataTab.qrCodeLink)}</span>
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
                <span>{t(IntlKeys.snapshotEditor.dataTab.download)}</span>
              </div>
              {integrationType && (
                <div
                  onClick={async () => {
                    void sendToIntegration({
                      base64Image: await getQrCodeBase64(directLink),
                      exportType: AreaButlerExportTypesEnum.QR_CODE,
                      fileTitle: t(
                        IntlKeys.snapshotEditor.dataTab.qrCodeFileName
                      ),
                      filename: `${t(
                        IntlKeys.snapshotEditor.dataTab.qrCodeLink
                      )}.png`,
                      // left just in case
                      // filename: `${searchAddress.replace(
                      //   /[\s|,]+/g,
                      //   "-"
                      // )}-QR-Code.png`,
                    });
                  }}
                >
                  <img src={sendToOnOfficeIcon} alt="send-to-integration" />
                  <span>{integrationNames[integrationType]}</span>
                </div>
              )}
            </div>

            {/* POI legend icons */}

            <div>
              <div>
                <img src={legendIcon} alt="download-legend" />
                <span>{t(IntlKeys.snapshotEditor.dataTab.legendPOIIcons)}</span>
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
                <span>{t(IntlKeys.snapshotEditor.dataTab.download)}</span>
              </div>
            </div>

            {/* iFrame */}

            <div>
              <div>
                <img src={iframeIcon} alt="iframe" />
                <span>
                  {t(IntlKeys.snapshotEditor.dataTab.iframeForWebsite)}
                </span>
              </div>
              <div
                onClick={() => {
                  copyTextToClipboard(codeSnippet);
                }}
              >
                <img src={copyIcon} alt="copy-iframe" />
                <span>{t(IntlKeys.common.copy)}</span>
              </div>
              {isIntUserIframeExportAvail && (
                <div
                  onClick={() => {
                    void sendToIntegration({
                      exportType: AreaButlerExportTypesEnum.INLINE_FRAME,
                      text: codeSnippet,
                    });
                  }}
                >
                  <img src={sendToOnOfficeIcon} alt="send-to-integration" />
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
