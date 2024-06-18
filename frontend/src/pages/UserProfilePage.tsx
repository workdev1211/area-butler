import { FunctionComponent, useContext, useEffect, useState } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { v4 as uuid } from "uuid";

import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import TourStarter from "tour/TourStarter";
import ProfileFormHandler from "user/ProfileFormHandler";
import SubscriptionPlanLimits from "user/SubscriptionPlanLimits";
import SubscriptionPlanSelection from "user/SubscriptionPlanSelection";
import { ApiTourNamesEnum, ApiUser } from "../../../shared/types/types";
import UserExportSettings from "../user/UserExportSettings";
import { deriveTotalRequestContingent } from "../shared/shared.functions";
import UserCrmSettings from "../user/UserCrmSettings";

const UserProfilePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const { get } = useHttp();
  const { userState, userDispatch } = useContext(UserContext);

  const formId = `form-${uuid()}`;
  const beforeSubmit = () => setBusy(true);
  const postSubmit = (success: boolean) => {
    setBusy(false);
  };

  const user: ApiUser = userState.user!;
  const hasSubscription = !!user.subscription;
  const totalRequestContingent = deriveTotalRequestContingent(user);
  const hasReachedRequestLimit =
    user.requestsExecuted >= totalRequestContingent;

  const isChild = user.isChild;
  const canCustomizeExport =
    hasSubscription && user.subscription!.config.appFeatures.canCustomizeExport;

  useEffect(() => {
    const fetchUser = async () => {
      const user: ApiUser = (await get<ApiUser>("/api/users/me")).data;
      userDispatch({ type: UserActionTypes.SET_USER, payload: user });
    };

    void fetchUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseClasses = "btn bg-primary-gradient w-full sm:w-auto";

  const SubmitButton: FunctionComponent = () => {
    const classes = `${baseClasses} ml-auto`;

    return (
      <button
        form={formId}
        key="submit"
        type="submit"
        disabled={busy}
        className={busy ? `busy ${classes}` : classes}
      >
        {t(IntlKeys.common.save)}
      </button>
    );
  };

  const SubscriptionLimitsOrSelection: FunctionComponent = () => {
    if (isChild) {
      return null;
    }

    return !hasSubscription || hasReachedRequestLimit ? (
      <SubscriptionPlanSelection />
    ) : (
      <SubscriptionPlanLimits user={userState.user!} />
    );
  };

  return (
    <DefaultLayout
      title={t(IntlKeys.yourProfile.title)}
      withHorizontalPadding={true}
      actionsBottom={[
        <BackButton to="/" key="user-profile-back" />,
        <SubmitButton key="user-profile-submit" />,
      ]}
    >
      {hasSubscription && <TourStarter tour={ApiTourNamesEnum.PROFILE} />}
      <div className="mt-10" data-tour="profile-form">
        <ProfileFormHandler
          user={userState.user!}
          formId={formId}
          beforeSubmit={beforeSubmit}
          postSubmit={postSubmit}
        />
      </div>
      {canCustomizeExport && <UserExportSettings />}
      <UserCrmSettings />
      <SubscriptionLimitsOrSelection />
    </DefaultLayout>
  );
};

export default UserProfilePage;
