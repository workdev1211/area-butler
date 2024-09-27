import { FC, useContext, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import SubscriptionPlanLimits from "user/SubscriptionPlanLimits";
import SubscriptionPlanSelection from "user/SubscriptionPlanSelection";
import CompanyExportSettings from "../company/CompanyExportSettings";
import { deriveTotalRequestContingent } from "../shared/shared.functions";
import { useUserState } from "../hooks/userstate";
import { ConfigContext } from "../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../shared/types/integration";

const CompanyProfilePage: FC = () => {
  const { integrationType } = useContext(ConfigContext);
  const { getActualUser, setUser } = useUserState();
  const { t } = useTranslation();

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;

  const isHasSubscription = !!user.subscription;
  const isRequestLimitReached = !isIntegrationUser
    ? user.requestsExecuted >= deriveTotalRequestContingent(user)
    : undefined;
  const isCustomExportAvail =
    isIntegrationUser ||
    (isHasSubscription &&
      user.subscription!.config.appFeatures.canCustomizeExport);

  useEffect(() => {
    if (!isIntegrationUser) {
      void setUser();
      return;
    }

    switch (integrationType) {
      case IntegrationTypesEnum.PROPSTACK: {
        // TODO refresh user / company info
        break;
      }

      case IntegrationTypesEnum.ON_OFFICE: {
        // TODO refresh user / company info
        break;
      }

      default: {
        console.error(
          `${t(IntlKeys.errors.wrongIntegration)}: ${integrationType}.`
        );

        throw new Error(t(IntlKeys.errors.wrongIntegration));
      }
    }

    void setUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SubscriptionLimitsOrSelection: FC = () => {
    if (isIntegrationUser || user.isChild) {
      return null;
    }

    return !isHasSubscription || isRequestLimitReached ? (
      <SubscriptionPlanSelection />
    ) : (
      <SubscriptionPlanLimits user={user} />
    );
  };

  return (
    <DefaultLayout
      title={t(IntlKeys.companyProfile.title)}
      withHorizontalPadding={true}
      actionsBottom={[<BackButton to="/" key="company-config-back" />]}
    >
      {isCustomExportAvail && <CompanyExportSettings />}

      <SubscriptionLimitsOrSelection />
    </DefaultLayout>
  );
};

export default CompanyProfilePage;
