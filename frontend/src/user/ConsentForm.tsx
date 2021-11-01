import Checkbox from "components/Checkbox";
import Input from "components/Input";
import { Form, Formik } from "formik";
import * as Yup from "yup";

export interface ConsentFormProps {
  formId: string;
  onSubmit: (values: any) => void;
  inviteCodeNeeded?: boolean;
}

export const ConsentForm: React.FunctionComponent<ConsentFormProps> = ({
  formId,
  onSubmit,
  inviteCodeNeeded = false,
}) => {
  return (
    <Formik
      initialValues={{
        consentGiven: false,
        inviteCode: ''
      }}
      validationSchema={Yup.object({
        consentGiven: Yup.boolean().oneOf([true], "Zustimmung benötigt."),
        inviteCode: inviteCodeNeeded ? Yup.string().required("Bitte Einladungscode eingeben") : Yup.string(),
      })}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      <Form id={formId}>
        <p>
          Bitte stimmen Sie den{" "}
          <a className="text-primary" href="/privacy" target="_blank">
            Datenschutzbestimmungen
          </a>{" "}
          zur Verwendung des Area Butlers zu
        </p>
        <div className="form-control">
          <Checkbox name="consentGiven">
            Ich stimme den Nutzungsbestimmungen zu
          </Checkbox>
        </div>
        {inviteCodeNeeded && (
          <div className="form-control mt-10">
            <Input
              label="Einladungscode"
              name="inviteCode"
              placeholder="Einladungscode"
              className="input input-bordered w-full"
            />
          </div>
        )}
      </Form>
    </Formik>
  );
};

export default ConsentForm;
