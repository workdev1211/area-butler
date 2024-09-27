import { FC, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import structuredClone from "@ungap/structured-clone";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import TourStarter from "tour/TourStarter";
import UserProfileFormHandler from "user/profile/UserProfileFormHandler";
import { ApiTourNamesEnum } from "../../../shared/types/types";
import UserCrmSettings from "../user/profile/UserCrmSettings";
import { useUserState } from "../hooks/userstate";
import {
  IUserProfileFormData,
  TUserProfileFormRef,
} from "../user/profile/UserProfileForm";
import { toastError, toastSuccess } from "../shared/shared.functions";
import { IApiUserConfig } from "../../../shared/types/user";

const mapFormDataToApiUserConfig = ({
  fullname,
}: IUserProfileFormData): Partial<IApiUserConfig> => ({
  fullname,
});

const UserProfilePage: FC = () => {
  const { getActualUser, setUser, updateUserConfig } = useUserState();
  const { t } = useTranslation();

  const [isBusy, setIsBusy] = useState(false);
  const formRef = useRef<TUserProfileFormRef>(null);

  // was created here because of the previous implementation of the save button
  // it was a submit button for the form with the following id
  const formId = `form-${uuid()}`;

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;
  const isSubscriptionAvail = !!user.subscription;

  useEffect(() => {
    void setUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SaveButton: FC = () => {
    const handleClick = async (): Promise<void> => {
      const userProfileForm = formRef.current;

      if (!isIntegrationUser && !userProfileForm) {
        return;
      }

      try {
        setIsBusy(true);
        const newUserConfig = structuredClone(user.config);

        if (userProfileForm) {
          const validErrors = await userProfileForm.validateForm();

          if (validErrors && Object.keys(validErrors).length) {
            toastError(t(IntlKeys.yourProfile.profileUpdateError));
            return;
          }

          Object.assign(newUserConfig, {
            ...mapFormDataToApiUserConfig(userProfileForm.values),
          });
        }

        await updateUserConfig(newUserConfig);
        toastSuccess(t(IntlKeys.yourProfile.profileUpdated));
      } catch (err) {
        toastError(t(IntlKeys.yourProfile.profileUpdateError));
      } finally {
        setIsBusy(false);
      }
    };

    return (
      <button
        disabled={isBusy}
        className={`btn bg-primary-gradient w-full sm:w-auto ml-auto${
          isBusy ? " busy" : ""
        }`}
        onClick={handleClick}
      >
        {t(IntlKeys.common.save)}
      </button>
    );
  };

  return (
    <DefaultLayout
      title={t(IntlKeys.yourProfile.title)}
      withHorizontalPadding={true}
      actionsBottom={[
        <BackButton key="user-profile-back" to="/" />,
        <SaveButton key="user-profile-save" />,
      ]}
    >
      {!isIntegrationUser && isSubscriptionAvail && (
        <TourStarter tour={ApiTourNamesEnum.PROFILE} />
      )}

      {!isIntegrationUser && (
        <div className="mt-10" data-tour="profile-form">
          <UserProfileFormHandler
            formId={formId}
            formRef={formRef}
            user={user}
          />
        </div>
      )}

      {!isIntegrationUser && <UserCrmSettings />}
    </DefaultLayout>
  );
};

export default UserProfilePage;
