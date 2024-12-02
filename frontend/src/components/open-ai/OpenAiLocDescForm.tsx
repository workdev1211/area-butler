import { FC, useContext, useEffect } from "react";
import structuredClone from "@ungap/structured-clone";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import { SearchContext } from "../../context/SearchContext";
import { meansOfTransportations } from "../../../../shared/constants/constants";
import { IOpenAiLocDescFormValues } from "../../../../shared/types/open-ai";
import { TFormikInnerRef } from "../../shared/shared.types";

interface IOpenAiLocDescFormListenProps {
  onValuesChange: (values: IOpenAiLocDescFormValues) => void;
}

const OpenAiLocDescFormListener: FC<IOpenAiLocDescFormListenProps> = ({
  onValuesChange,
}): null => {
  const { values } = useFormikContext<IOpenAiLocDescFormValues>();

  useEffect(() => {
    onValuesChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.meanOfTransportation]);

  return null;
};

interface IOpenAiLocDescFormProps {
  formId: string;
  initialValues?: IOpenAiLocDescFormValues;
  onValuesChange?: (values: IOpenAiLocDescFormValues) => void;
  onSubmit?: (values: IOpenAiLocDescFormValues) => void;
  formRef?: TFormikInnerRef<IOpenAiLocDescFormValues>;
}

const OpenAiLocDescForm: FC<IOpenAiLocDescFormProps> = ({
  formId,
  initialValues,
  onValuesChange,
  onSubmit,
  formRef,
}) => {
  const { t } = useTranslation();
  const {
    searchContextState: { transportationParams },
  } = useContext(SearchContext);

  const meansOfTransportation = transportationParams
    .map(
      ({ type: existingType }) =>
        meansOfTransportations.find(
          ({ type: constantType }) => constantType === existingType
        )!
    )
    .reverse();

  const resultInitValues = initialValues
    ? structuredClone(initialValues)
    : ({} as IOpenAiLocDescFormValues);

  resultInitValues.meanOfTransportation =
    (resultInitValues.meanOfTransportation &&
      meansOfTransportation.find(
        ({ type }) => type === resultInitValues?.meanOfTransportation
      )?.type) ||
    meansOfTransportation[0].type;

  const validationSchema = Yup.object({
    meanOfTransportation: Yup.string(),
  });

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
      <Form id={formId}>
        <div className="form-control">
          <Select
            label={t(IntlKeys.snapshotEditor.dataTab.aiFieldOfKnowledge)}
            placeholder={t(IntlKeys.snapshotEditor.dataTab.aiFieldOfKnowledge)}
            name="meanOfTransportation"
            disabled={meansOfTransportation.length === 1}
            defaultValue={resultInitValues.meanOfTransportation}
          >
            {meansOfTransportation.map(({ mode, type }) => (
              <option value={type} key={type}>
                {t(
                  (
                    IntlKeys.common.transportationTypes as Record<
                      string,
                      string
                    >
                  )[mode]
                )}
              </option>
            ))}
          </Select>
        </div>

        {typeof onValuesChange === "function" && (
          <OpenAiLocDescFormListener
            onValuesChange={(values) => {
              onValuesChange(values);
            }}
          />
        )}
      </Form>
    </Formik>
  );
};

export default OpenAiLocDescForm;
