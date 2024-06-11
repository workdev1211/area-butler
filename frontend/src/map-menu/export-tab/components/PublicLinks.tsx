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
import {
  IApiIntSetPropPubLinksReq,
  IntegrationTypesEnum,
} from "../../../../../shared/types/integration";
import { UserContext } from "../../../context/UserContext";
import { AreaButlerExportTypesEnum } from "../../../../../shared/types/types";

const PublicLinks: FC = () => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { responseConfig, responseTokens },
  } = useContext(SearchContext);
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { t } = useTranslation();
  const { sendToIntegration } = useIntegrationTools();
  const { createDirectLink } = useTools();

  // TODO: confirm translations here
  const addressLinkTitle = "Mit Adresse - AreaButler Link";
  const unaddressLinkTitle = "Anonym - AreaButler Link ohne Adresse";

  const directLink = createDirectLink();
  const isLinkEntity =
    integrationType === IntegrationTypesEnum.PROPSTACK ||
    integrationUser?.config.isSpecialLink;
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
          <span>{t(IntlKeys.snapshotEditor.exportTab.publicLink)}</span>
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
                      isAddressShown: !!responseConfig?.showAddress,
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

      <div>
        <div>
          <img src={urlIcon} alt="iframe-url" />
          <span>{t(IntlKeys.snapshotEditor.exportTab.publicLinks)}</span>
        </div>

        {isSentBothAvail && (
          <div
            onClick={() => {
              void sendToIntegration({
                exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS,
                publicLinkParams: [
                  {
                    isLinkEntity,
                    isAddressShown: true,
                    title: addressLinkTitle,
                    url: createDirectLink({ isAddressShown: true }),
                  },
                  {
                    isLinkEntity,
                    isAddressShown: false,
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
        )}
      </div>
    </>
  );
};

export default PublicLinks;
