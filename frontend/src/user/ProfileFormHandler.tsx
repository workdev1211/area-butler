import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { useContext } from "react";
import { toastError, toastSuccess } from "shared/shared.functions";
import { ApiUpsertUser, ApiUser } from "../../../shared/types/types";
import ProfileForm from "./ProfileForm";

export const mapFormToApiUpsertUser = async (
  values: any
): Promise<Partial<ApiUpsertUser>> => {
  return {
    fullname: values.fullname
  };
};

export interface ProfileFormHandlerProps {
  user: Partial<ApiUser>;
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
}

const ProfileFormHandler: React.FunctionComponent<ProfileFormHandlerProps> = ({
  formId,
  user,
  beforeSubmit = () => {},
  postSubmit = () => {}
}) => {
  const { post } = useHttp();

  const { userDispatch } = useContext(UserContext);

  const onSubmit = async (values: any) => {
    const mappedUser: Partial<ApiUpsertUser> = await mapFormToApiUpsertUser(
      values
    );

    try {
      beforeSubmit();
      const updatedUser = (await post<ApiUser>("/api/users/me", mappedUser))
        .data;
      userDispatch({ type: UserActionTypes.SET_USER, payload: updatedUser });
      toastSuccess("Profil aktualisiert!");
      postSubmit(true);
    } catch (err) {
      console.log(err);
      toastError("Fehler beim Aktualisieren Ihres Profiles");
      postSubmit(false);
    }
  };

  return <ProfileForm formId={formId!} onSubmit={onSubmit} inputUser={user} />;
};

export default ProfileFormHandler;
