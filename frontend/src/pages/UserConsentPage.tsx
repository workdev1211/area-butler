import { ConfigContext } from "context/ConfigContext";
import { UserContext } from "context/UserContext";
import DefaultLayout from "layout/defaultLayout";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import ConsentFormHandler from "user/ConsentFormHandler";
import { v4 as uuid } from "uuid";

const UserConsentPage: FunctionComponent = () => {
  const [busy, setBusy] = useState(false);
  const history = useHistory();
  const { userState } = useContext(UserContext);
  const { inviteCodeNeeded } = useContext(ConfigContext);

  const formId = `form-${uuid()}`;
  const beforeSubmit = () => setBusy(true);
  const postSubmit = (success: boolean) => {
    setBusy(false);
  };

  useEffect(() => {
    if (!!userState?.user?.consentGiven) {
      history.push("/");
    }
  }, [userState, history]);

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
        Zustimmen
      </button>
    );
  };

  return (
    <DefaultLayout
      title="Nutzungsbestimmungen"
      withHorizontalPadding={true}
      actionBottom={[<SubmitButton key="user-consent-submit" />]}
    >
      <div className="mt-10">
        <ConsentFormHandler
          formId={formId}
          beforeSubmit={beforeSubmit}
          postSubmit={postSubmit}
          inviteCodeNeeded={inviteCodeNeeded}
        ></ConsentFormHandler>
      </div>
    </DefaultLayout>
  );
};

export default UserConsentPage;
