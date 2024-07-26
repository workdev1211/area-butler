import {FunctionComponent, useEffect, useState} from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import {Form, Formik, useFormikContext} from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import {
  openAiCustomTextOptions,
  openAiTextLengthOptions,
  openAiTonalities,
} from "../../../../shared/constants/open-ai";
import {
  IOpenAiGeneralFormValues,
  OpenAiCustomTextEnum,
  OpenAiTextLengthEnum,
  OpenAiTonalityEnum,
} from "../../../../shared/types/open-ai";
import {TFormikInnerRef} from "../../shared/shared.types";
import {defaultTargetGroupName} from "../../../../shared/constants/potential-customer";
import {usePotentialCustomerData} from "../../hooks/potentialcustomerdata";
// import RangeInput from "../inputs/formik/RangeInput";
import CustomTextSelect from "../inputs/formik/CustomTextSelect";
import {ISelectTextValue} from "../../../../shared/types/types";
import {camelize} from "../../../../shared/functions/shared.functions";

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

interface IOpenAiGeneralFormProps {
  formId: string;
  initialValues?: IOpenAiGeneralFormValues;
  onValuesChange?: (values: IOpenAiGeneralFormValues) => void;
  onSubmit?: (values: IOpenAiGeneralFormValues) => void;
  isFromOnePage?: boolean;
  formRef?: TFormikInnerRef<IOpenAiGeneralFormValues>;
}

const OpenAiGeneralForm: FunctionComponent<IOpenAiGeneralFormProps> = ({
  formId,
  initialValues,
  onValuesChange,
  onSubmit,
  isFromOnePage,
  formRef,
}) => {
  const { t } = useTranslation();
  const { fetchPotentCustomerNames } = usePotentialCustomerData();

  const custTargetGroupOption: ISelectTextValue = {
    text: t(IntlKeys.snapshotEditor.dataTab.enterYourOwnTargetGroup),
    value: "custom",
  };

  const defTargetGroupOption: ISelectTextValue = {
    text: t(IntlKeys.snapshotEditor.dataTab.defaultTargetGroupName),
    value: "default",
  };

  const [targetGroupOptions, setTargetGroupOptions] = useState<
    ISelectTextValue[]
  >([defTargetGroupOption, custTargetGroupOption]);

  const resultInitValues: IOpenAiGeneralFormValues = initialValues
    ? {
        ...initialValues,
      }
    : {
        tonality: OpenAiTonalityEnum.EASYGOING_YOUTHFUL,
        targetGroupName: defaultTargetGroupName,
        customText: "",
        textLength: isFromOnePage ? undefined : OpenAiTextLengthEnum.MEDIUM,
      };

  const validationSchema = Yup.object({
    tonality: Yup.string().oneOf(Object.values(OpenAiTonalityEnum)).optional(),
    targetGroupName: Yup.string().optional(),
    customText: Yup.string().optional(),
    textLength: Yup.string()
      .oneOf(Object.values(OpenAiTextLengthEnum))
      .optional(),
  });

  useEffect(() => {
    const fetchTargetGroupNames = async () => {
      const fetchedNames = await fetchPotentCustomerNames();

      setTargetGroupOptions([
        defTargetGroupOption,
        ...fetchedNames.map((name) => ({ text: name, value: camelize(name) })),
        custTargetGroupOption,
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
            <div className="form-control max-w-xs">
              <CustomTextSelect
                mainLabel={t(IntlKeys.snapshotEditor.dataTab.targetGroup)}
                label={t(IntlKeys.snapshotEditor.dataTab.targetGroupName)}
                placeholder={t(IntlKeys.snapshotEditor.dataTab.targetGroupName)}
                name="targetGroupName"
                selectOptions={targetGroupOptions}
                customTextValue={custTargetGroupOption.value}
                initialText={initialValues?.targetGroupName}
                textLengthLimit={250}
                isInput={true}
              />
            </div>

            <div className="form-control">
              <Select
                label={t(IntlKeys.snapshotEditor.dataTab.textTonality)}
                placeholder={t(IntlKeys.snapshotEditor.dataTab.textTonality)}
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

            {/* !!! The failed attempt to limit the OpenAI output to a certain amount of words / characters !!! */}
            {/*<RangeInput*/}
            {/*  label="Gewünschte Zeichenanzahl"*/}
            {/*  placeholder="Gewünschte Zeichenanzahl"*/}
            {/*  name="characterLimit"*/}
            {/*  type="range"*/}
            {/*  min={minCharacterNumber}*/}
            {/*  max={maxCharacterNumber}*/}
            {/*  step={100}*/}
            {/*  className="input input-bordered range max-w-xs"*/}
            {/*/>*/}

            {!isFromOnePage && (
              <div className="form-control">
                <Select
                  label={t(IntlKeys.snapshotEditor.dataTab.desiredTextLength)}
                  placeholder={t(IntlKeys.snapshotEditor.dataTab.desiredTextLength)}
                  name="textLength"
                  defaultValue={OpenAiTextLengthEnum.MEDIUM}
                >
                  {openAiTextLengthOptions.map(({ text, value }) => (
                    <option value={value} key={value}>
                      {text}
                    </option>
                  ))}
                </Select>
              </div>
            )}

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
                  data-tip={t(IntlKeys.snapshotEditor.dataTab.customTextTooltip)}
                >
                  i
                </div>
              </div>

              <div className="grid w-full">
                <CustomTextSelect
                  mainLabel={t(IntlKeys.snapshotEditor.dataTab.furtherAIInstructions)}
                  label={t(IntlKeys.snapshotEditor.dataTab.resultsText, { count: values.customText?.length })}
                  placeholder={t(IntlKeys.snapshotEditor.dataTab.userDefinedText)}
                  name="customText"
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
