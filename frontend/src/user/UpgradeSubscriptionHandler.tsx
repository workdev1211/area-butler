import { Form, Formik } from "formik";
import { FunctionComponent } from "react";

export interface UpgradeSubscriptionHandlerProps {
  message: string;
  formId?: string;
  onSubmit: () => void
}

const UpgradeSubscriptionHandler: FunctionComponent<UpgradeSubscriptionHandlerProps> =
  ({ message, formId, onSubmit }) => {
    return (
        <div>
        <Formik initialValues={{}} onSubmit={(values => onSubmit())}>
            <Form id={formId}>
            </Form>
        </Formik>
        {message && <p className="my-5">{message}</p>}
        <p>
          Zum Freischalten der Funktion wechseln Sie zu Ihrem Abonnement
        </p>
      </div>
    );
  };

export default UpgradeSubscriptionHandler;
