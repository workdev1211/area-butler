import { FunctionComponent, useContext, useEffect } from "react";
import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import { SearchContext } from "../../context/SearchContext";
import {
  openAiCustomText,
  openAiTonalities,
} from "../../../../shared/constants/open-ai";
import { meansOfTransportations } from "../../../../shared/constants/constants";
import {
  IOpenAiLocationDescriptionFormValues,
  OpenAiCustomTextEnum,
  OpenAiTonalityEnum,
} from "../../../../shared/types/open-ai";
import CustomTextareaSelect from "../inputs/formik/CustomTextareaSelect";
import { TFormikInnerRef } from "../../shared/shared.types";

interface IOpenAiLocationDescriptionFormListenerProps {
  onValuesChange: (values: IOpenAiLocationDescriptionFormValues) => void;
}

const OpenAiLocationDescriptionFormListener: FunctionComponent<
  IOpenAiLocationDescriptionFormListenerProps
> = ({ onValuesChange }) => {
  const { values } = useFormikContext<IOpenAiLocationDescriptionFormValues>();

  useEffect(() => {
    onValuesChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.meanOfTransportation, values.tonality, values.customText]);

  return null;
};

interface ILocationDescriptionFormProps {
  formId: string;
  initialValues?: IOpenAiLocationDescriptionFormValues;
  onValuesChange?: (values: IOpenAiLocationDescriptionFormValues) => void;
  onSubmit?: (values: IOpenAiLocationDescriptionFormValues) => void;
  formRef?: TFormikInnerRef<IOpenAiLocationDescriptionFormValues>;
}

const OpenAiLocationDescriptionForm: FunctionComponent<
  ILocationDescriptionFormProps
> = ({ formId, initialValues, onValuesChange, onSubmit, formRef }) => {
  const { searchContextState } = useContext(SearchContext);

  const meansOfTransportation = searchContextState.transportationParams.map(
    ({ type }) => {
      const { label, type: value } = meansOfTransportations.find(
        ({ type: constantType }) => type === constantType
      )!;

      return { label, value };
    }
  );

  const processedInitialValues = initialValues
    ? {
        ...initialValues,
        meanOfTransportation: meansOfTransportation.some(
          ({ value }) => value === initialValues?.meanOfTransportation
        )
          ? initialValues?.meanOfTransportation
          : meansOfTransportation[0].value,
      }
    : {
        meanOfTransportation: meansOfTransportation[0].value,
        tonality: OpenAiTonalityEnum.EASYGOING_YOUTHFUL,
        customText: undefined,
      };

  const validationSchema = Yup.object({
    meanOfTransportation: Yup.string(),
    tonality: Yup.string(),
    customText: Yup.object({
      text: Yup.string().required(),
      value: Yup.string().required(),
    }).optional(),
  });

  return (
    <Formik
      initialValues={processedInitialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        if (typeof onSubmit === "function") {
          onSubmit(values);
        }
      }}
      innerRef={formRef}
    >
      {({ values }) => {
        return (
          <Form id={formId}>
            <>
              <div className="form-control">
                <Select
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
                <div className="indicator w-full">
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
                  <div className="grid place-items-center w-full">
                    <CustomTextareaSelect
                      label={`Ergebnisse und Arbeitsfeld, ${values.customText?.text.length} Zeichen`}
                      name="customText"
                      placeholder="Benutzerdefinierter Text"
                      customTextValue={{
                        text: "",
                        value: OpenAiCustomTextEnum.CUSTOM,
                      }}
                      emptyTextValue={{
                        text: "",
                        value: OpenAiCustomTextEnum.NONE,
                      }}
                      selectedTextValue={initialValues?.customText}
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

              {typeof onValuesChange === "function" && (
                <OpenAiLocationDescriptionFormListener
                  onValuesChange={(values) => {
                    onValuesChange(values);
                  }}
                />
              )}
            </>
          </Form>
        );
      }}
    </Formik>
  );
};

export default OpenAiLocationDescriptionForm;
