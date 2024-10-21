import { FC, useContext } from "react";
import { useTranslation } from "react-i18next";

import sendToOnOfficeIcon from "../../../assets/icons/entrance-alt1.svg";
import copyIcon from "../../../assets/icons/copy.svg";
import urlIcon from "../../../assets/icons/link.svg";
import { copyTextToClipboard } from "../../../shared/shared.functions";
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
  const { getActualUser } = useUserState();

  const user = getActualUser();
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
  const isLinkEntity = isIntegrationUser
    ? user.config.isSpecialLink
    : undefined;
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
              const linkData: Omit<IApiIntSetPropPubLinksReq, "integrationId"> =
                {
                  exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS,
                  publicLinkParams: [
                    {
                      isLinkEntity,
                      exportType: !!responseConfig?.showAddress
                        ? AreaButlerExportTypesEnum.LINK_WITH_ADDRESS
                        : AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
                      title: responseConfig?.showAddress
                        ? unaddressLinkTitle
                        : addressLinkTitle,
                      url: directLink,
                    },
                  ],
                };

              void sendToIntegration(linkData);
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
              void sendToIntegration({
                exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS,
                publicLinkParams: [
                  {
                    isLinkEntity,
                    exportType: AreaButlerExportTypesEnum.LINK_WITH_ADDRESS,
                    title: addressLinkTitle,
                    url: createDirectLink({ isAddressShown: true }),
                  },
                  {
                    isLinkEntity,
                    exportType: AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
                    title: unaddressLinkTitle,
                    url: createDirectLink({ isAddressShown: false }),
                  },
                ],
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
