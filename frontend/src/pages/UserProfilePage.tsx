import { ConfigContext } from "context/ConfigContext";
import { PotentialCustomerContext } from "context/PotentialCustomerContext";
import { RealEstateContext } from "context/RealEstateContext";
import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import TourStarter from "tour/TourStarter";
import EmbeddableMapsTable from "user/EmbeddableMapsTable";
import InviteCodesTable from "user/InviteCodesTable";
import ProfileFormHandler from "user/ProfileFormHandler";
import SubscriptionPlanLimits from "user/SubscriptionPlanLimits";
import SubscriptionPlanSelection from "user/SubscriptionPlanSelection";
import { v4 as uuid } from "uuid";
import {
  ApiSearchResultSnapshotResponse,
  ApiUser,
} from "../../../shared/types/types";
import UserExportSettings from "../user/UserExportSettings";

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

  const user: ApiUser = userState.user!;
  const hasSubscription = !!user.subscriptionPlan;
  const canCustomizeExport =
    hasSubscription &&
    user.subscriptionPlan!.config.appFeatures.canCustomizeExport;

  const embedddableMaps = userState.embeddableMaps || [];

  useEffect(() => {
    const fetchUser = async () => {
      const user: ApiUser = (await get<ApiUser>("/api/users/me")).data;
      userDispatch({ type: UserActionTypes.SET_USER, payload: user });
    };

    const fetchEmbeddableMaps = async () => {
      const embeddableMaps: ApiSearchResultSnapshotResponse[] = (
        await get<ApiSearchResultSnapshotResponse[]>(
          "/api/location/user-embeddable-maps"
        )
      ).data;
      userDispatch({
        type: UserActionTypes.SET_EMBEDDABLE_MAPS,
        payload: embeddableMaps,
      });
    };

    fetchUser();
    fetchEmbeddableMaps();
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
      {hasSubscription && embedddableMaps.length && (
        <div className="my-10">
          <h1 className="text-lg font-bold mb-5">Ihre Karten Snippets</h1>
          <EmbeddableMapsTable embeddableMaps={embedddableMaps} />
        </div>
      )}
      {hasSubscription ? (
        <SubscriptionPlanLimits
          realEstates={realEstateState.listings}
          user={userState.user!}
          customers={potentialCustomerState.customers}
        />
      ) : (
        <SubscriptionPlanSelection />
      )}
      {hasSubscription && inviteCodeNeeded && (
        <div className="my-10">
          <h1 className="text-lg font-bold mb-5">Ihre Einladungscodes</h1>
          <InviteCodesTable />
        </div>
      )}
    </DefaultLayout>
  );
};

export default UserProfilePage;
