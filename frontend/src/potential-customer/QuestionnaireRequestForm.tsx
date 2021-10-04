import { Input } from "components/Input";
import { Form, Formik } from "formik";
import { FunctionComponent } from "react";
import * as Yup from "yup";

export interface QuestionnaireRequestFormProps {
  formId: string;
  onSubmit: (values: any) => any;
}

export const QuestionnaireRequestForm: FunctionComponent<QuestionnaireRequestFormProps> =
  ({ formId, onSubmit }) => {
    return (
      <Formik
        initialValues={{
          name: "",
          email: "",
        }}
        validationSchema={Yup.object({
          name: Yup.string().required("Bitte geben den Namen ein"),
          email: Yup.string()
            .email()
            .required("Bitte geben Sie eine gültige Email-Adresse ein"),
          preferredLocations: Yup.array(),
        })}
        onSubmit={(values) => {
          const formValues = {
            ...values,
          };
          onSubmit(formValues);
        }}
        render={({ values }) => (
          <Form id={formId}>
            <div className="form-control">
              <Input
                label="Name des Interessenten"
                name="name"
                type="text"
                placeholder="Name"
              />
            </div>
            <div className="form-control">
              <Input
                label="Email des Interessenten"
                name="email"
                type="text"
                placeholder="Email"
              />
            </div>
          </Form>
        )}
      ></Formik>
    );
  };

export default QuestionnaireRequestForm;
