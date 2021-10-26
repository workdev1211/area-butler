import { RealEstateContext } from "context/RealEstateContext";
import { UserActions, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import ProfileFormHandler from "user/ProfileFormHandler";
import SubscriptionPlanLimits from "user/SubscriptionPlanLimits";
import { v4 as uuid } from "uuid";
import { ApiUser } from "../../../shared/types/types";

const UserProfilePage: FunctionComponent = () => {
  const [busy, setBusy] = useState(false);
  const { get } = useHttp();
  const { userState, userDispatch } = useContext(UserContext);
  const { realEstateState } = useContext(RealEstateContext);

  const formId = `form-${uuid()}`;
  const beforeSubmit = () => setBusy(true);
  const postSubmit = (success: boolean) => {
    setBusy(false);
  };

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
      <div className="mt-10">
        <ProfileFormHandler
          user={userState.user}
          formId={formId}
          beforeSubmit={beforeSubmit}
          postSubmit={postSubmit}
        ></ProfileFormHandler>
      </div>
      <SubscriptionPlanLimits
        realEstates={realEstateState.listings}
        user={userState.user}
      ></SubscriptionPlanLimits>
    </DefaultLayout>
  );
};

export default UserProfilePage;
