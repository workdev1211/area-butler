import { FC, useEffect, useState } from "react";
import structuredClone from "@ungap/structured-clone";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import {
  openAiCustomTextOptions,
  openAiTextLengthOptions,
} from "../../../../shared/constants/open-ai";
import {
  IOpenAiGeneralFormValues,
  OpenAiCustomTextEnum,
  OpenAiTextLengthEnum,
  OpenAiTonalityEnum,
} from "../../../../shared/types/open-ai";
import { TFormikInnerRef } from "../../shared/shared.types";
import { defaultTargetGroupName } from "../../../../shared/constants/potential-customer";
import { usePotentialCustomerData } from "../../hooks/potentialcustomerdata";
// import RangeInput from "../inputs/formik/RangeInput";
import CustomNumberSelect from "../inputs/formik/CustomNumberSelect";
import { ISelectTextValue } from "../../../../shared/types/types";
import { useUserState } from "../../hooks/userstate";
import CustomTextSelectV2 from "../inputs/formik/CustomTextSelectV2";
import { Loading } from "../Loading";

interface IOpenAiGeneralFormListenerProps {
  onValuesChange: (values: IOpenAiGeneralFormValues) => void;
}

const OpenAiGeneralFormListener: FC<IOpenAiGeneralFormListenerProps> = ({
  onValuesChange,
}): null => {
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
  defaultTextLength?: number;
}

const OpenAiGeneralForm: FC<IOpenAiGeneralFormProps> = ({
  formId,
  initialValues,
  onValuesChange,
  onSubmit,
  isFromOnePage,
  formRef,
  defaultTextLength,
}) => {
  const { t } = useTranslation();
  const { fetchPotentCustomerNames } = usePotentialCustomerData();

  const { getCurrentUser } = useUserState();
  const user = getCurrentUser();
  const isIntegrationUser = "integrationUserId" in user;

  const custTargetGroupOption: ISelectTextValue = {
    text: t(IntlKeys.snapshotEditor.dataTab.enterYourOwnTargetGroup),
    value: t(IntlKeys.snapshotEditor.dataTab.enterYourOwnTargetGroup),
  };

  const defTargetGroupOption: ISelectTextValue = {
    text: t(IntlKeys.snapshotEditor.dataTab.defaultTargetGroupName),
    value: t(IntlKeys.snapshotEditor.dataTab.defaultTargetGroupName),
  };

  const [targetGroupOptions, setTargetGroupOptions] =
    useState<ISelectTextValue[]>();

  const resultInitValues = initialValues
    ? structuredClone(initialValues)
    : {
        tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        targetGroupName: defaultTargetGroupName,
        textLength: isFromOnePage ? undefined : OpenAiTextLengthEnum.MEDIUM,
        maxCharactersLength: defaultTextLength,
      };

  let customText = initialValues?.customText || "";

  // Schmitt Immo hack
  if (
    isIntegrationUser &&
    new RegExp(/^18925(-\d+)?$/).test(user.integrationUserId)
  ) {
    customText =
      "bodenständig, keine Übertreibungen, Zielgruppe nicht explizit nennen, Struktur: 1ter Absatz Einleitung, 2ter Absatz Key Facts und zwar Stichpunktartig, 3ter Absatz Vorzüge der Lage (mindestens drei relevante POIs mit Name und Meter-Entfernung nennen) und Zusammenfassung";
  }

  resultInitValues.customText = customText;

  const validationSchema = Yup.object({
    tonality: Yup.string().oneOf(Object.values(OpenAiTonalityEnum)).optional(),
    targetGroupName: Yup.string().optional(),
    customText: Yup.string().optional(),
    textLength: Yup.string()
      .oneOf(Object.values(OpenAiTextLengthEnum))
      .optional(),
    maxCharactersLength: Yup.number().integer().optional(),
  });

  useEffect(() => {
    const fetchTargetGroupNames = async () => {
      const fetchedNames = await fetchPotentCustomerNames();

      setTargetGroupOptions([
        defTargetGroupOption,
        ...fetchedNames.map((name) => ({ text: name, value: name })),
        custTargetGroupOption,
      ]);
    };

    void fetchTargetGroupNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!targetGroupOptions?.length) {
    return <Loading />;
  }

  return (
    <Formik
      initialValues={resultInitValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        if (typeof onSubmit === "function") {
          onSubmit(values);
        }
      }}
      enableReinitialize={true}
      innerRef={formRef}
    >
      {({ values }) => {
        return (
          <Form id={formId}>
            <div className="max-w-xs">
              <CustomTextSelectV2
                name="targetGroupName"
                label={t(IntlKeys.snapshotEditor.dataTab.targetGroup)}
                inputLabel={t(IntlKeys.snapshotEditor.dataTab.targetGroupName)}
                selectOptions={targetGroupOptions}
                customTextValue={custTargetGroupOption.value}
                placeholder={t(IntlKeys.snapshotEditor.dataTab.targetGroupName)}
                textLengthLimit={250}
                isInput={true}
              />
            </div>

            <div className="form-control">
              <Select
                label={t(IntlKeys.snapshotEditor.dataTab.textTonality)}
                placeholder={t(IntlKeys.snapshotEditor.dataTab.textTonality)}
                name="tonality"
                defaultValue={
                  initialValues?.tonality || OpenAiTonalityEnum.FORMAL_SERIOUS
                }
              >
                {Object.values(OpenAiTonalityEnum).map((tonality) => (
                  <option value={tonality} key={tonality}>
                    {t(IntlKeys.snapshotEditor.dataTab.tonalities[tonality])}
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
              <div className="form-control max-w-xs">
                <CustomNumberSelect
                  mainName="textLength"
                  name="maxCharactersLength"
                  selectOptions={openAiTextLengthOptions.map(({ value }) => ({
                    value,
                    text: t(
                      (
                        IntlKeys.snapshotEditor.dataTab.textLength as Record<
                          string,
                          string
                        >
                      )[value]
                    ),
                  }))}
                  mainLabel={t(
                    IntlKeys.snapshotEditor.dataTab.desiredTextLength
                  )}
                  label={t(IntlKeys.snapshotEditor.dataTab.maxCharactersLength)}
                  customTextValue={OpenAiTextLengthEnum.SPECIFIC}
                />
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
                  data-tip={t(
                    IntlKeys.snapshotEditor.dataTab.customTextTooltip
                  )}
                >
                  i
                </div>
              </div>

              <div className="grid w-full">
                <CustomTextSelectV2
                  name="customText"
                  label={t(
                    IntlKeys.snapshotEditor.dataTab.furtherAIInstructions
                  )}
                  inputLabel={t(IntlKeys.snapshotEditor.dataTab.resultsText, {
                    count: values.customText?.length,
                  })}
                  selectOptions={openAiCustomTextOptions.map(({ value }) => ({
                    value,
                    text: t(IntlKeys.snapshotEditor.dataTab.customTexts[value]),
                  }))}
                  customTextValue={OpenAiCustomTextEnum.CUSTOM}
                  emptyTextValue={OpenAiCustomTextEnum.NONE}
                  placeholder={t(
                    IntlKeys.snapshotEditor.dataTab.userDefinedText
                  )}
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
