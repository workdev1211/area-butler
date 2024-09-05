import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { toastError, toastSuccess } from "shared/shared.functions";
import { ApiUpsertUser, ApiUser } from "../../../shared/types/types";
import ProfileForm from "./ProfileForm";
import { useUserState } from "../hooks/userstate";

const mapFormToApiUpsertUser = async (
  values: any
): Promise<Partial<ApiUpsertUser>> => {
  return {
    fullname: values.fullname,
  };
};

interface IProfileFormHandlerProps {
  user: Partial<ApiUser>;
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
}

const ProfileFormHandler: FC<IProfileFormHandlerProps> = ({
  formId,
  user,
  beforeSubmit = () => {},
  postSubmit = () => {},
}) => {
  const { updateUserConfig } = useUserState();
  const { t } = useTranslation();

  const onSubmit = async (values: any): Promise<void> => {
    const mappedUser: Partial<ApiUpsertUser> = await mapFormToApiUpsertUser(
      values
    );

    try {
      beforeSubmit();
      await updateUserConfig(mappedUser);
      toastSuccess(t(IntlKeys.yourProfile.profileUpdated));
      postSubmit(true);
    } catch (err) {
      console.error(err);
      toastError(t(IntlKeys.yourProfile.profileUpdateError));
      postSubmit(false);
    }
  };

  return <ProfileForm formId={formId!} onSubmit={onSubmit} inputUser={user} />;
};

export default ProfileFormHandler;
