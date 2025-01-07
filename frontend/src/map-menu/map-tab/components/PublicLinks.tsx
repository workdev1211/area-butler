import { FC, useContext } from "react";
import { useTranslation } from "react-i18next";

import sendToOnOfficeIcon from "../../../assets/icons/entrance-alt1.svg";
import copyIcon from "../../../assets/icons/copy.svg";
import urlIcon from "../../../assets/icons/link.svg";
import {
  copyTextToClipboard,
  toastError,
} from "../../../shared/shared.functions";
import { useIntegrationTools } from "../../../hooks/integration/integrationtools";
import { ConfigContext } from "../../../context/ConfigContext";
import { integrationNames } from "../../../../../shared/constants/integration";
import { useTools } from "../../../hooks/tools";
import { IntlKeys } from "i18n/keys";
import { SearchContext } from "../../../context/SearchContext";
import { IApiIntSetPropPubLinksReq } from "../../../../../shared/types/integration";
import { AreaButlerExportTypesEnum } from "../../../../../shared/types/types";
import { useUserState } from "../../../hooks/userstate";

const PublicLinks: FC = () => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { responseConfig, responseTokens },
  } = useContext(SearchContext);

  const { t } = useTranslation();
  const { sendToIntegration } = useIntegrationTools();
  const { createDirectLink } = useTools();
  const { getCurrentUser } = useUserState();

  const user = getCurrentUser();
  const isIntegrationUser = "integrationUserId" in user;

  // TODO: confirm translations here
  let addressLinkTitle = "Mit Adresse - AreaButler Link";
  let unaddressLinkTitle = "Anonym - AreaButler Link ohne Adresse";

  // Schmitt Immo hack
  if (
    isIntegrationUser &&
    new RegExp(/^18925(-\d+)?$/).test(user.integrationUserId)
  ) {
    addressLinkTitle = "Interaktive Karte";
    unaddressLinkTitle = "Interaktive anonyme Karte";
  }

  const directLink = createDirectLink({ language: responseConfig?.language });

  const isSentBothAvail = !!(
    integrationType &&
    responseTokens?.addressToken &&
    responseTokens?.unaddressToken
  );

  return (
    <>
      <div>
        <div>
          <img src={urlIcon} alt="iframe-url" />
          <span>{t(IntlKeys.snapshotEditor.dataTab.publicLink)}</span>
        </div>

        <div
          onClick={() => {
            copyTextToClipboard(directLink);
          }}
        >
          <img src={copyIcon} alt="copy" />
          <span>{t(IntlKeys.common.copy)}</span>
        </div>

        {integrationType && (
          <div
            onClick={() => {
              const exportType = !!responseConfig?.showAddress
                ? AreaButlerExportTypesEnum.LINK_WITH_ADDRESS
                : AreaButlerExportTypesEnum.LINK_WO_ADDRESS;

              const linkData: Omit<IApiIntSetPropPubLinksReq, "integrationId"> =
                {
                  exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS,
                  publicLinkParams: [
                    {
                      exportType,
                      title: responseConfig?.showAddress
                        ? unaddressLinkTitle
                        : addressLinkTitle,
                      url: directLink,
                    },
                  ],
                };

              void sendToIntegration(linkData, false).catch((e) => {
                const message =
                  user.config.exportMatching?.[exportType] &&
                  e.response?.status === 400
                    ? t(IntlKeys.errors.checkExpMatchLinkCfg)
                    : t(IntlKeys.common.errorOccurred);

                toastError(message);
                console.error(e);
              });
            }}
          >
            <img src={sendToOnOfficeIcon} alt="send-to-integration" />
            <span>{integrationNames[integrationType!]}</span>
          </div>
        )}
      </div>

      {isSentBothAvail && (
        <div>
          <div>
            <img src={urlIcon} alt="iframe-url" />
            <span>{t(IntlKeys.snapshotEditor.dataTab.publicLinks)}</span>
          </div>

          <div
            onClick={() => {
              void sendToIntegration(
                {
                  exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS,
                  publicLinkParams: [
                    {
                      exportType: AreaButlerExportTypesEnum.LINK_WITH_ADDRESS,
                      title: addressLinkTitle,
                      url: createDirectLink({ isAddressShown: true }),
                    },
                    {
                      exportType: AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
                      title: unaddressLinkTitle,
                      url: createDirectLink({ isAddressShown: false }),
                    },
                  ],
                },
                false
              ).catch((e) => {
                const message =
                  e.response?.status === 400 &&
                  (user.config.exportMatching?.[
                    AreaButlerExportTypesEnum.LINK_WITH_ADDRESS
                  ] ||
                    user.config.exportMatching?.[
                      AreaButlerExportTypesEnum.LINK_WO_ADDRESS
                    ])
                    ? t(IntlKeys.errors.checkExpMatchLinkCfg)
                    : t(IntlKeys.common.errorOccurred);

                toastError(message);
                console.error(e);
              });
            }}
          >
            <img src={sendToOnOfficeIcon} alt="send-to-integration" />
            <span>{integrationNames[integrationType!]}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicLinks;
