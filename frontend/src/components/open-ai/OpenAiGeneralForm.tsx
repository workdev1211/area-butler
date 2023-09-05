import { FunctionComponent, useEffect, useState } from "react";
import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import {
  defaultCharacterNumber,
  maxCharacterNumber,
  minCharacterNumber,
  openAiCustomTextOptions,
  openAiTonalities,
} from "../../../../shared/constants/open-ai";
import {
  IOpenAiGeneralFormValues,
  OpenAiCustomTextEnum,
  OpenAiTonalityEnum,
} from "../../../../shared/types/open-ai";
import { TFormikInnerRef } from "../../shared/shared.types";
import { defaultTargetGroupName } from "../../../../shared/constants/potential-customer";
import { usePotentialCustomerData } from "../../hooks/potentialcustomerdata";
import RangeInput from "../inputs/formik/RangeInput";
import CustomTextSelect from "../inputs/formik/CustomTextSelect";

interface IOpenAiGeneralFormListenerProps {
  onValuesChange: (values: IOpenAiGeneralFormValues) => void;
}

const OpenAiGeneralFormListener: FunctionComponent<
  IOpenAiGeneralFormListenerProps
> = ({ onValuesChange }) => {
  const { values } = useFormikContext<IOpenAiGeneralFormValues>();

  useEffect(() => {
    onValuesChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(values)]);

  return null;
};

interface IGeneralFormProps {
  formId: string;
  initialValues?: IOpenAiGeneralFormValues;
  onValuesChange?: (values: IOpenAiGeneralFormValues) => void;
  onSubmit?: (values: IOpenAiGeneralFormValues) => void;
  formRef?: TFormikInnerRef<IOpenAiGeneralFormValues>;
}

const OpenAiGeneralForm: FunctionComponent<IGeneralFormProps> = ({
  formId,
  initialValues,
  onValuesChange,
  onSubmit,
  formRef,
}) => {
  const { fetchPotentCustomerNames } = usePotentialCustomerData();

  const [potentCustomerNames, setPotentCustomerNames] = useState<string[]>([
    defaultTargetGroupName,
  ]);

  const resultInitValues: IOpenAiGeneralFormValues = initialValues
    ? {
        ...initialValues,
      }
    : {
        tonality: OpenAiTonalityEnum.EASYGOING_YOUTHFUL,
        targetGroupName: defaultTargetGroupName,
        customText: "",
        characterLimit: defaultCharacterNumber,
      };

  const validationSchema = Yup.object({
    tonality: Yup.string().oneOf(Object.values(OpenAiTonalityEnum)).optional(),
    targetGroupName: Yup.string().optional(),
    customText: Yup.string().optional(),
    characterLimit: Yup.number().optional(),
  });

  useEffect(() => {
    const fetchTargetGroupNames = async () => {
      setPotentCustomerNames([
        defaultTargetGroupName,
        ...(await fetchPotentCustomerNames()),
      ]);
    };

    void fetchTargetGroupNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Formik
      initialValues={resultInitValues}
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
            <div className="form-control">
              <Select
                label="Zielgruppe Name"
                placeholder="Zielgruppe Name"
                name="targetGroupName"
                disabled={potentCustomerNames.length === 1}
                defaultValue={resultInitValues.targetGroupName}
              >
                {potentCustomerNames.map((potentCustomerName) => (
                  <option
                    value={potentCustomerName}
                    key={`potential-customer-${potentCustomerName}`}
                  >
                    {potentCustomerName}
                  </option>
                ))}
              </Select>
            </div>

            <div className="form-control">
              <Select
                label="Texttonalität"
                placeholder="Texttonalität"
                name="tonality"
                defaultValue={OpenAiTonalityEnum.EASYGOING_YOUTHFUL}
              >
                {Object.values(OpenAiTonalityEnum).map((tonality) => (
                  <option value={tonality} key={tonality}>
                    {openAiTonalities[tonality]}
                  </option>
                ))}
              </Select>
            </div>

            <RangeInput
              label="Gewünschte Zeichenanzahl"
              placeholder="Gewünschte Zeichenanzahl"
              name="characterLimit"
              type="range"
              min={minCharacterNumber}
              max={maxCharacterNumber}
              step={100}
              className="input input-bordered range max-w-xs"
            />

            <div className="form-control mt-3 indicator w-full">
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
                <CustomTextSelect
                  label={`Ergebnisse und Arbeitsfeld, ${values.customText?.length} Zeichen`}
                  name="customText"
                  placeholder="Benutzerdefinierter Text"
                  selectOptions={openAiCustomTextOptions}
                  customTextValue={OpenAiCustomTextEnum.CUSTOM}
                  emptyTextValue={OpenAiCustomTextEnum.NONE}
                  initialText={initialValues?.customText}
                />
              </div>
            </div>

            {typeof onValuesChange === "function" && (
              <OpenAiGeneralFormListener
                onValuesChange={(values) => {
                  onValuesChange(values);
                }}
              />
            )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default OpenAiGeneralForm;
