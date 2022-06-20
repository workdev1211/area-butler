import { FunctionComponent } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Select from "../components/Select";
import {
  ILimitIncreaseParams,
  ILimitIncreasePriceId,
} from "./IncreaseLimitFormHandler";

export interface IncreaseRequestLimitFormProps {
  formId: string;
  onSubmit: (values: ILimitIncreasePriceId) => void;
  limitIncreaseParams: ILimitIncreaseParams[];
  label: string;
  description: string;
}

const IncreaseLimitForm: FunctionComponent<IncreaseRequestLimitFormProps> = ({
  formId,
  onSubmit,
  limitIncreaseParams,
  label,
  description,
}) => {
  const validationSchema = Yup.object({ priceId: Yup.string() });

  return (
    <Formik
      initialValues={{ priceId: limitIncreaseParams[0].priceId }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      <Form id={formId}>
        <p>{description}</p>
        <div className="form-control">
          <Select
            className="input input-bordered w-full"
            label={label}
            placeholder={label}
            name="priceId"
            disabled={limitIncreaseParams.length === 1}
          >
            {limitIncreaseParams.map((param) => (
              <option value={param.priceId} key={param.priceId}>
                {param.amount.value}
              </option>
            ))}
          </Select>
        </div>
      </Form>
    </Formik>
  );
};

export default IncreaseLimitForm;
