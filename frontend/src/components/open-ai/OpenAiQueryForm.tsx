import { FunctionComponent } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import { IApiOpenAiQuery } from "../../../../shared/types/open-ai";
import { TFormikInnerRef } from "../../shared/shared.types";
import FormikValuesChangeListener from "../FormikValuesChangeListener";
import Textarea from "../inputs/formik/Textarea";

interface IRequestFormProps {
  formId: string;
  isFormalToInformal?: boolean;
  onSubmit?: (values: IApiOpenAiQuery) => void;
  onValuesChange?: (values: IApiOpenAiQuery) => void;
  formRef?: TFormikInnerRef<IApiOpenAiQuery>;
}

const OpenAiQueryForm: FunctionComponent<IRequestFormProps> = ({
  formId,
  isFormalToInformal = false,
  onSubmit,
  onValuesChange,
  formRef,
}) => {
  const label = isFormalToInformal
    ? "Kopieren Sie hier den Text in Sie Form hinein"
    : "Ihre Anfrage an die KI";

  const validationSchema = Yup.object({
    text: Yup.string(),
    isFormalToInformal: Yup.boolean(),
  });

  return (
    <Formik
      initialValues={{ isFormalToInformal, text: undefined }}
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
            <FormikValuesChangeListener
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
