import { FC, useEffect, useState } from "react";
import { v4 } from "uuid";

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
import CompanyProfileFormHandler from "../company/form/CompanyProfileFormHandler";

const CompanyProfilePage: FC = () => {
  const { fetchCurrentUser, getCurrentUser } = useUserState();
  const { t } = useTranslation();

  const [isBusy, setIsBusy] = useState(false);

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
    if (isIntegrationUser) {
      return null;
    }

    return (
      <>
        {(!isHasSubscription || isRequestLimitReached) && !user.isChild ? (
          <SubscriptionPlanSelection />
        ) : (
          <SubscriptionPlanLimits user={user} />
        )}

        <div className="divider" />
      </>
    );
  };

  const formId = `form-${v4()}`;

  const SubmitButton: FC = () => {
    if (!isIntegrationUser) {
      return null;
    }

    const classes = "btn bg-primary-gradient w-full sm:w-auto ml-auto";

    return (
      <button
        form={formId}
        key="submit"
        type="submit"
        disabled={isBusy}
        className={`${isBusy ? "busy " : ""}${classes}`}
      >
        {t(IntlKeys.common.save)}
      </button>
    );
  };

  return (
    <DefaultLayout
      title={t(IntlKeys.companyProfile.title)}
      withHorizontalPadding={true}
      actionsBottom={[
        <BackButton to="/" key="company-config-back" />,
        <SubmitButton key="customer-submit" />,
      ]}
    >
      <div className="flex flex-col gap-3 mt-6 mb-3">
        {isCustomExportAvail && (
          <>
            <CompanyExportSettings />
            <div className="divider" />
          </>
        )}

        {isIntegrationUser && (
          <>
            <CompanyProfileFormHandler formId={formId} setIsBusy={setIsBusy} />
            <div className="divider" />
          </>
        )}

        <SubscriptionLimitsOrSelection />
        <CompanyTemplateId />
      </div>
    </DefaultLayout>
  );
};

export default CompanyProfilePage;
