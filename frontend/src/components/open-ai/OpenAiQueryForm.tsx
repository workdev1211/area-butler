import { FunctionComponent, useEffect } from "react";
import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";

import { IApiOpenAiQuery } from "../../../../shared/types/open-ai";
import { TFormikInnerRef } from "../../shared/shared.types";
import Textarea from "../inputs/formik/Textarea";

interface IOpenAiQueryFormListenerProps {
  onValuesChange: (values: IApiOpenAiQuery) => void;
}

const OpenAiQueryFormListener: FunctionComponent<
  IOpenAiQueryFormListenerProps
> = ({ onValuesChange }) => {
  const { values } = useFormikContext<IApiOpenAiQuery>();

  useEffect(() => {
    onValuesChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.text]);

  return null;
};

interface IQueryFormProps {
  formId: string;
  initialValues?: IApiOpenAiQuery;
  onValuesChange?: (values: IApiOpenAiQuery) => void;
  onSubmit?: (values: IApiOpenAiQuery) => void;
  formRef?: TFormikInnerRef<IApiOpenAiQuery>;
}

const OpenAiQueryForm: FunctionComponent<IQueryFormProps> = ({
  formId,
  initialValues,
  onValuesChange,
  onSubmit,
  formRef,
}) => {
  const label = initialValues?.isFormalToInformal
    ? "Kopieren Sie hier den Text in Sie Form hinein"
    : "Ihre Anfrage an die KI";

  const validationSchema = Yup.object({
    text: Yup.string(),
  });

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues || { text: undefined }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        if (typeof onSubmit === "function") {
          onSubmit(values);
        }
      }}
      innerRef={formRef}
    >
      <Form id={formId}>
        <>
          <div className="form-control">
            <Textarea rows={12} label={label} name="text" placeholder={label} />
          </div>

          {typeof onValuesChange === "function" && (
            <OpenAiQueryFormListener
              onValuesChange={(values) => {
                onValuesChange(values);
              }}
            />
          )}
        </>
      </Form>
    </Formik>
  );
};

export default OpenAiQueryForm;
