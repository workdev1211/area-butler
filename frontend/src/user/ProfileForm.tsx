import { Form, Formik } from "formik";
import { ApiUpsertUser, ApiUser } from "../../../shared/types/types";
import * as Yup from "yup";
import Input from "components/Input";
import Select from "components/Select";

export interface ProfileFormProps {
  formId: string;
  inputUser: Partial<ApiUser>;
  onSubmit: (newValues: Partial<ApiUpsertUser>) => void;
}

export const ProfileForm: React.FunctionComponent<ProfileFormProps> = ({
  formId,
  inputUser,
  onSubmit,
}) => {
  return (
    <Formik
      initialValues={{
        fullname: inputUser?.fullname,
        email: inputUser?.email,
        subscriptionPlan: inputUser?.subscriptionPlan?.type
      }}
      validationSchema={Yup.object({
        fullname: Yup.string().required("Bitte geben Sie einen Namen ein"),
        email: Yup.string()
          .email()
          .required("Bitte geben Sie eine gültige Email-Adresse ein"),
        subscriptionPlan: Yup.string(),
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
        <div className="form-control">
          <Select
            label="Subscription Plan DEV ONLY"
            name="subscriptionPlan"
            placeholder="Subscription Plan DEV ONLY"
          >
            <option value="STANDARD">Standard</option>
            <option value="PRO">Pro</option>
            <option value="BUSINESS_PLUS">Business+</option>
          </Select>
        </div>
      </Form>
    </Formik>
  );
};

export default ProfileForm;
