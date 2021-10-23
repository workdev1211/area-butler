import { UserContext } from "context/UserContext";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import { FunctionComponent, useContext, useState } from "react";
import ProfileFormHandler from "user/ProfileFormHandler";
import {v4 as uuid} from 'uuid';

const UserProfilePage: FunctionComponent = () => {
  const [busy, setBusy] = useState(false);
  const { userState } = useContext(UserContext);

  const formId = `form-${uuid()}`;
  const beforeSubmit = () => setBusy(true);
  const postSubmit = (success: boolean) => {
    setBusy(false);
  };

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
      <ProfileFormHandler user={userState.user} formId={formId}></ProfileFormHandler>
    </DefaultLayout>
  );
};

export default UserProfilePage;