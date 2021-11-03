import { ConfigContext } from "context/ConfigContext";
import { PotentialCustomerContext } from "context/PotentialCustomerContext";
import { RealEstateContext } from "context/RealEstateContext";
import { UserActions, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import TourStarter from "tour/TourStarter";
import InviteCodesTable from "user/InviteCodesTable";
import ProfileFormHandler from "user/ProfileFormHandler";
import SubscriptionPlanLimits from "user/SubscriptionPlanLimits";
import SubscriptionPlanSelection from "user/SubscriptionPlanSelection";
import { v4 as uuid } from "uuid";
import { ApiUser } from "../../../shared/types/types";

const UserProfilePage: FunctionComponent = () => {
  const [busy, setBusy] = useState(false);
  const { get } = useHttp();
  const { inviteCodeNeeded } = useContext(ConfigContext);
  const { userState, userDispatch } = useContext(UserContext);
  const { realEstateState } = useContext(RealEstateContext);
  const { potentialCustomerState } = useContext(PotentialCustomerContext);

  const formId = `form-${uuid()}`;
  const beforeSubmit = () => setBusy(true);
  const postSubmit = (success: boolean) => {
    setBusy(false);
  };

  const user: ApiUser = userState.user;
  const hasSubscription = !!user.subscriptionPlan;

  useEffect(() => {
    const fetchUser = async () => {
      const user: ApiUser = (await get<ApiUser>("/api/users/me")).data;
      userDispatch({ type: UserActions.SET_USER, payload: user });
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [true]);

  const baseClasses = "btn bg-primary-gradient w-full sm:w-auto";

  const SubmitButton: React.FunctionComponent = () => {
    const classes = baseClasses + " ml-auto";
    return (
      <button
        form={formId}
        key="submit"
        type="submit"
        disabled={busy}
        className={busy ? "busy " + classes : classes}
      >
        Speichern
      </button>
    );
  };

  return (
    <DefaultLayout
      title="Ihr Profil"
      withHorizontalPadding={true}
      actionBottom={[
        <BackButton to="/" key="user-profile-back" />,
        <SubmitButton key="user-profile-submit" />,
      ]}
    >
      {hasSubscription && <TourStarter tour='profile' />}
      <div className="mt-10" data-tour="profile-form">
        <ProfileFormHandler
          user={userState.user}
          formId={formId}
          beforeSubmit={beforeSubmit}
          postSubmit={postSubmit}
        ></ProfileFormHandler>
      </div>
      {hasSubscription ? (
        <SubscriptionPlanLimits
          realEstates={realEstateState.listings}
          user={userState.user}
          customers={potentialCustomerState.customers}
        ></SubscriptionPlanLimits>
      ) : (
        <SubscriptionPlanSelection></SubscriptionPlanSelection>
      )}
      {hasSubscription && inviteCodeNeeded && (
        <div className="my-10">
          <h1 className="text-lg font-bold mb-5">Ihre Einladungscodes</h1>
          <InviteCodesTable></InviteCodesTable>
        </div>
      )}
    </DefaultLayout>
  );
};

export default UserProfilePage;
