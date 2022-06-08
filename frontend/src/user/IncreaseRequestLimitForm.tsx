import { FunctionComponent } from "react";
import * as Yup from "yup";
import { Form, Formik } from "formik";

import Input from "components/Input";

export interface IncreaseRequestLimitFormProps {
  amount: number;
  formId: string;
  onSubmit: (values: any) => void;
}

const IncreaseRequestLimitForm: FunctionComponent<
  IncreaseRequestLimitFormProps
> = ({ formId, onSubmit, amount }) => {
  return (
    <Formik
      initialValues={{ amount }}
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
          Bitte kaufen Sie ein weiteres Kontingent für 30,00 € (zzgl. MwSt.)
          oder wechseln Sie auf einen höheren Plan
        </p>

        <div className="form-control">
          <Input
            label="Abfrage Kontingent"
            name="amount"
            type="number"
            disabled={true}
            placeholder="Abfrage Kontingent"
            className="input input-bordered w-full"
          />
        </div>
      </Form>
    </Formik>
  );
};

export default IncreaseRequestLimitForm;
