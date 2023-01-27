import { FunctionComponent } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Input from "components/inputs/formik/Input";
import { ApiUpsertUser, ApiUser } from "../../../shared/types/types";

interface IProfileFormProps {
  formId: string;
  inputUser: Partial<ApiUser>;
  onSubmit: (newValues: Partial<ApiUpsertUser>) => void;
}

export const ProfileForm: FunctionComponent<IProfileFormProps> = ({
  formId,
  inputUser,
  onSubmit,
}) => {
  return (
    <Formik
      initialValues={{
        fullname: inputUser?.fullname,
        email: inputUser?.email,
      }}
      validationSchema={Yup.object({
        fullname: Yup.string().required("Bitte geben Sie einen Namen ein"),
        email: Yup.string()
          .email()
          .required("Bitte geben Sie eine gültige Email-Adresse ein"),
      })}
      onSubmit={(values) => {
        const formValues = {
          ...values,
        };
        onSubmit(formValues);
      }}
    >
      <Form id={formId}>
        <div className="form-control">
          <Input
            disabled={true}
            label="Ihre Email-Adresse"
            name="email"
            type="text"
            placeholder="Ihre Email-Adresse"
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control">
          <Input
            label="Ihr Name"
            name="fullname"
            type="text"
            placeholder="Ihr Name"
            className="input input-bordered w-full"
          />
        </div>
      </Form>
    </Formik>
  );
};

export default ProfileForm;
