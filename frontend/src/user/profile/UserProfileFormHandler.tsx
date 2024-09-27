import { FC } from "react";

import { ApiUser } from "../../../../shared/types/types";
import UserProfileForm, { IUserProfileFormData } from "./UserProfileForm";
import { TFormikInnerRef } from "../../shared/shared.types";

interface IProfileFormHandlerProps {
  formId: string;
  formRef: TFormikInnerRef<IUserProfileFormData>;
  user: ApiUser;
}

const UserProfileFormHandler: FC<IProfileFormHandlerProps> = ({
  formId,
  formRef,
  user,
}) => {
  return <UserProfileForm formId={formId} formRef={formRef} user={user} />;
};

export default UserProfileFormHandler;
