import React, { FunctionComponent, useContext } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Select from "../components/inputs/formik/Select";
import { SearchContext } from "../context/SearchContext";
import {
  openAiCustomText,
  openAiTonalities,
} from "../../../shared/constants/open-ai";
import { meansOfTransportations } from "../../../shared/constants/constants";
import {
  OpenAiCustomTextEnum,
  OpenAiTonalityEnum,
} from "../../../shared/types/open-ai";
import CustomTextareaSelect from "../components/inputs/formik/CustomTextareaSelect";

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
    customText: Yup.string(),
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
        tonality: OpenAiTonalityEnum.EASYGOING_YOUTHFUL,
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
            {Object.values(OpenAiTonalityEnum).map((key) => (
              <option value={key} key={key}>
                {openAiTonalities[key]}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-control mt-3">
          <div className="indicator">
            <div
              className="indicator-item badge w-5 h-5 text-white"
              style={{
                border: "1px solid var(--primary)",
                borderRadius: "50%",
                backgroundColor: "var(--primary)",
              }}
            >
              <div
                className="tooltip tooltip-left tooltip-accent text-justify font-medium"
                data-tip="In dieses Feld können Sie einen zusätzlichen Wunsch an die KI eingeben. Dieser Wunsch wird bei der Erstellung des Textes möglichst berücksichtigt."
              >
                i
              </div>
            </div>
            <div className="grid place-items-center">
              <CustomTextareaSelect
                label="Benutzerdefinierter Text"
                name="customText"
                placeholder="Benutzerdefinierter Text"
                customTextValue={OpenAiCustomTextEnum.CUSTOM}
                emptyTextValue={OpenAiCustomTextEnum.NONE}
              >
                {openAiCustomText.map(({ type, label }) => (
                  <option value={type} key={type}>
                    {label}
                  </option>
                ))}
              </CustomTextareaSelect>
            </div>
          </div>
        </div>
      </Form>
    </Formik>
  );
};

export default OpenAiLocationForm;
