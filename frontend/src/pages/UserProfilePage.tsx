import { FunctionComponent, useContext, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import { PotentialCustomerContext } from "context/PotentialCustomerContext";
import { RealEstateContext } from "context/RealEstateContext";
import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import TourStarter from "tour/TourStarter";
import ProfileFormHandler from "user/ProfileFormHandler";
import SubscriptionPlanLimits from "user/SubscriptionPlanLimits";
import SubscriptionPlanSelection from "user/SubscriptionPlanSelection";
import { ApiUser } from "../../../shared/types/types";
import UserExportSettings from "../user/UserExportSettings";

const UserProfilePage: FunctionComponent = () => {
  const [busy, setBusy] = useState(false);
  const { get } = useHttp();
  const { userState, userDispatch } = useContext(UserContext);
  const { realEstateState } = useContext(RealEstateContext);
  const { potentialCustomerState } = useContext(PotentialCustomerContext);

  const formId = `form-${uuid()}`;
  const beforeSubmit = () => setBusy(true);
  const postSubmit = (success: boolean) => {
    setBusy(false);
  };

  const user: ApiUser = userState.user!;
  const hasSubscription = !!user.subscription;
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
        Speichern
      </button>
    );
  };

  const SubscriptionLimitsOrSelection: FunctionComponent = () => {
    if (isChild) {
      return null;
    }

    return hasSubscription ? (
      <SubscriptionPlanLimits
        realEstates={realEstateState.listings}
        user={userState.user!}
        customers={potentialCustomerState.customers}
      />
    ) : (
      <SubscriptionPlanSelection />
    );
  };

  return (
    <DefaultLayout
      title="Ihr Profil"
      withHorizontalPadding={true}
      actionsBottom={[
        <BackButton to="/" key="user-profile-back" />,
        <SubmitButton key="user-profile-submit" />,
      ]}
    >
      {hasSubscription && <TourStarter tour="profile" />}
      <div className="mt-10" data-tour="profile-form">
        <ProfileFormHandler
          user={userState.user!}
          formId={formId}
          beforeSubmit={beforeSubmit}
          postSubmit={postSubmit}
        />
      </div>
      {canCustomizeExport && <UserExportSettings />}
      <SubscriptionLimitsOrSelection />
    </DefaultLayout>
  );
};

export default UserProfilePage;
