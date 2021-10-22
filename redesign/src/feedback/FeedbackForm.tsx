
import Select from "components/Select";
import Textarea from "components/Textarea";
import { Form, Formik } from "formik";
import * as Yup from "yup";

export interface FeedbackFormData {
  formId: string;
  onSubmit: (values: any) => any;
}

export const FeedbackForm: React.FunctionComponent<FeedbackFormData> = ({
  formId,
  onSubmit,
}) => {
  return (
    <Formik
      initialValues={{
        description: "",
        type: "IMPROVEMENT",
      }}
      validationSchema={Yup.object({
        type: Yup.string().required("Bitte geben Sie die Art des Feedbacks an"),
        description: Yup.string().required(
          "Bitte geben Sie eine Beschreibung an"
        ),
      })}
      onSubmit={onSubmit}
    >
      <Form id={formId}>
        <div className="form-control">
          <Select
            label="Art des Feedbacks"
            name="type"
            type="number"
            placeholder="Art des Feedbacks"
          >
            <option value="IMPROVEMENT">Verbesserung</option>
            <option value="ERROR">Fehler</option>
            <option value="OTHER">Sonstiges</option>
          </Select>
        </div>
        <div className="form-control">
          <Textarea
            rows="12"
            label="Beschreibung"
            name="description"
            type="text"
            placeholder="Beschreibung"
          />
        </div>
      </Form>
    </Formik>
  );
};

export default FeedbackForm;
