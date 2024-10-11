import { FC, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import SubscriptionPlanLimits from "user/SubscriptionPlanLimits";
import SubscriptionPlanSelection from "user/SubscriptionPlanSelection";
import CompanyExportSettings from "../company/CompanyExportSettings";
import { deriveTotalRequestContingent } from "../shared/shared.functions";
import { useUserState } from "../hooks/userstate";
import CompanyTemplateId from "../company/CompanyTemplateId";

const CompanyProfilePage: FC = () => {
  const { fetchCurrentUser, getCurrentUser } = useUserState();
  const { t } = useTranslation();

  const user = getCurrentUser();
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
    void fetchCurrentUser();
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
      <div className="flex flex-col gap-10 my-10">
        {isCustomExportAvail && <CompanyExportSettings />}

        <SubscriptionLimitsOrSelection />

        <CompanyTemplateId />
      </div>
    </DefaultLayout>
  );
};

export default CompanyProfilePage;
