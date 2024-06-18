import { FunctionComponent, useContext, useEffect } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

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

const OpenAiLocDescFormListener: FunctionComponent<
  IOpenAiLocDescFormListenProps
> = ({ onValuesChange }) => {
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

const OpenAiLocDescForm: FunctionComponent<IOpenAiLocDescFormProps> = ({
  formId,
  initialValues,
  onValuesChange,
  onSubmit,
  formRef,
}) => {
  const { t } = useTranslation();
  const { searchContextState } = useContext(SearchContext);

  const meansOfTransportation = searchContextState.transportationParams.map(
    ({ type }) => {
      const { label, type: value, mode } = meansOfTransportations.find(
        ({ type: constantType }) => type === constantType
      )!;

      return { label, value, mode };
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
      };

  const validationSchema = Yup.object({
    meanOfTransportation: Yup.string(),
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
      <Form id={formId}>
        <div className="form-control">
          <Select
            label={t(IntlKeys.snapshotEditor.exportTab.aiFieldOfKnowledge)}
            placeholder={t(IntlKeys.snapshotEditor.exportTab.aiFieldOfKnowledge)}
            name="meanOfTransportation"
            disabled={meansOfTransportation.length === 1}
            defaultValue={processedInitialValues.meanOfTransportation}
          >
            {meansOfTransportation.map(({ mode, value }) => (
              <option value={value} key={value}>
                {t((IntlKeys.common.transportationTypes as Record<string, string>)[mode])}
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
