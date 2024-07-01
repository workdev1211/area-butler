import { Form, Formik } from "formik";
import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

export interface UpgradeSubscriptionHandlerProps {
  message: React.ReactNode;
  formId?: string;
  onSubmit: () => void;
}

const UpgradeSubscriptionHandler: FunctionComponent<
  UpgradeSubscriptionHandlerProps
> = ({ message, formId, onSubmit }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Formik initialValues={{}} onSubmit={(values) => onSubmit()}>
        <Form id={formId}></Form>
      </Formik>
      {message && <p className="my-5">{message}</p>}
      <p>{t(IntlKeys.subscriptions.toActivateSwitchOnSubscription)}</p>
    </div>
  );
};

export default UpgradeSubscriptionHandler;
