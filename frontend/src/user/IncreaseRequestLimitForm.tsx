import Input from "components/Input";
import { Form, Formik } from "formik";
import * as Yup from "yup";

export interface IncreaseRequestLimitFormProps {
  formId: string;
  onSubmit: (values: any) => void;
}

const IncreaseRequestLimitForm: React.FunctionComponent<IncreaseRequestLimitFormProps> =
  ({ formId, onSubmit }) => {
    return (
      <Formik
        initialValues={{
          amount: 20,
        }}
        validationSchema={Yup.object({
          amount: Yup.number().min(0, "Kontingent darf nicht negativ sein."),
        })}
        onSubmit={(values) => {
          onSubmit(values);
        }}
      >
        <Form id={formId}>
          <p>
            Ihr Aktuelles Abfrage Kontingent lässt keine weiteren Abfragen zu.
            Bitte kaufen Sie ein weiteres Kontingent oder wechseln Sie auf einen
            höheren Plan
          </p>

          <div className="form-control">
            <Input
              label="Abfrage Kontingent"
              name="amount"
              type="number"
              placeholder="Abfrage Kontingent"
              className="input input-bordered w-full"
            />
          </div>
        </Form>
      </Formik>
    );
  };

export default IncreaseRequestLimitForm;
