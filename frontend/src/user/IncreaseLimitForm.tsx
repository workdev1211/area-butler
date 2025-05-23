import { FunctionComponent, useState, BaseSyntheticEvent } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Select from "../components/inputs/formik/Select";
import {
  ILimitIncreaseParams,
  ILimitIncreasePriceId,
} from "./IncreaseLimitFormHandler";

export interface IncreaseRequestLimitFormProps {
  formId: string;
  onSubmit: (values: ILimitIncreasePriceId) => void;
  limitIncreaseParams: ILimitIncreaseParams[];
}

const IncreaseLimitForm: FunctionComponent<IncreaseRequestLimitFormProps> = ({
  formId,
  onSubmit,
  limitIncreaseParams,
}) => {
  const validationSchema = Yup.object({ priceId: Yup.string() });
  const [labelDescription, setLabelDescription] = useState({
    label: limitIncreaseParams[0].name,
    description: limitIncreaseParams[0].description,
  });

  return (
    <Formik
      initialValues={{ priceId: limitIncreaseParams[0].priceId }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      {({ setFieldValue }) => (
        <Form id={formId}>
          <p className="text-justify">{labelDescription.description}</p>
          <div className="form-control">
            <Select
              label={labelDescription.label}
              placeholder={labelDescription.label}
              name="priceId"
              disabled={limitIncreaseParams.length === 1}
              onChange={(e: BaseSyntheticEvent<ILimitIncreaseParams>) => {
                const foundParam = limitIncreaseParams.find(
                  (param) => param.priceId === e.target.value
                );

                setLabelDescription({
                  label: foundParam?.name,
                  description: foundParam?.description,
                });

                setFieldValue("priceId", e.target.value);
              }}
            >
              {limitIncreaseParams.map((param) => (
                <option value={param.priceId} key={param.priceId}>
                  {param.amount.value}
                </option>
              ))}
            </Select>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default IncreaseLimitForm;
