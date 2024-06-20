import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { Form, Formik } from "formik";
import * as Yup from "yup";

import Select from "components/inputs/formik/Select";
import Textarea from "components/inputs/formik/Textarea";

interface IFeedbackFormData {
  formId: string;
  onSubmit: (values: any) => any;
}

export const FeedbackForm: FunctionComponent<IFeedbackFormData> = ({
  formId,
  onSubmit,
}) => {
  const { t } = useTranslation();
  return (
    <Formik
      initialValues={{
        description: "",
        type: "IMPROVEMENT",
      }}
      validationSchema={Yup.object({
        type: Yup.string().required(
          t(IntlKeys.snapshotEditor.specifyTypeOfFeedback)
        ),
        description: Yup.string().required(
          t(IntlKeys.snapshotEditor.enterDescription)
        ),
      })}
      onSubmit={onSubmit}
    >
      <Form id={formId}>
        <div className="form-control">
          <Select
            label={t(IntlKeys.snapshotEditor.typeOfFeedback)}
            name="type"
            type="number"
            placeholder={t(IntlKeys.snapshotEditor.typeOfFeedback)}
          >
            <option value="IMPROVEMENT">
              {t(IntlKeys.snapshotEditor.improvement)}
            </option>
            <option value="ERROR">{t(IntlKeys.snapshotEditor.error)}</option>
            <option value="OTHER">{t(IntlKeys.snapshotEditor.other)}</option>
          </Select>
        </div>
        <div className="form-control">
          <Textarea
            rows={12}
            label={t(IntlKeys.common.description)}
            name="description"
            placeholder={t(IntlKeys.common.description)}
          />
        </div>
      </Form>
    </Formik>
  );
};

export default FeedbackForm;
