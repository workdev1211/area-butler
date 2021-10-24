import Checkbox from "components/Checkbox";
import { Form, Formik } from "formik";
import * as Yup from "yup";

export interface ConsentFormProps {
  formId: string;
  onSubmit: (values: any) => void;
}

export const ConsentForm: React.FunctionComponent<ConsentFormProps> = ({
  formId,
  onSubmit,
}) => {
  return (
    <Formik
      initialValues={{
        consentGiven: false,
      }}
      validationSchema={Yup.object({
        consentGiven: Yup.boolean().oneOf([true], "Zustimmung benötigt.")
      })}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      <Form id={formId}>
        <p>
            Bitte stimmen Sie den <a className="text-primary" href="/privacy" target="_blank">Datenschutzbestimmungen</a> zur Verwendung des Area Butlers zu
        </p>      
        <div className="form-control">
          <Checkbox name="consentGiven">
            Ich stimme den Nutzungsbestimmungen zu
          </Checkbox>
        </div>
      </Form>
    </Formik>
  );
};

export default ConsentForm;
