import { FunctionComponent, useContext } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Select from "../components/Select";
import { SearchContext } from "../context/SearchContext";
import { openAiTonalities } from "../../../shared/constants/open-ai";
import { meansOfTransportations } from "../../../shared/constants/constants";

export interface IOpenAiLocationFormProps {
  formId: string;
  onSubmit: (values: any) => void;
}

const OpenAiLocationForm: FunctionComponent<IOpenAiLocationFormProps> = ({
  formId,
  onSubmit,
}) => {
  const validationSchema = Yup.object({
    meanOfTransportation: Yup.string(),
    tonality: Yup.string(),
  });

  const { searchContextState } = useContext(SearchContext);

  const meansOfTransportation = searchContextState.transportationParams.map(
    ({ type }) => {
      const { label, type: value } = meansOfTransportations.find(
        ({ type: constantType }) => type === constantType
      )!;

      return { label, value };
    }
  );

  return (
    <Formik
      initialValues={{
        meanOfTransportation: meansOfTransportation[0].value,
        tonality: openAiTonalities[0].type,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      <Form id={formId}>
        <div className="form-control">
          <Select
            className="input input-bordered w-full"
            label="Transportmitteln"
            placeholder="Transportmitteln"
            name="meanOfTransportation"
            disabled={meansOfTransportation.length === 1}
          >
            {meansOfTransportation.map(({ label, value }) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-control">
          <Select
            className="input input-bordered w-full"
            label="Texttonalität"
            placeholder="Texttonalität"
            name="tonality"
          >
            {openAiTonalities.map(({ label, type }) => (
              <option value={type} key={type}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </Form>
    </Formik>
  );
};

export default OpenAiLocationForm;
