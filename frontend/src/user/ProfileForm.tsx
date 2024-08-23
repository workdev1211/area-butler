import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

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
  const { t } = useTranslation();
  return (
    <Formik
      initialValues={{
        fullname: inputUser?.config?.fullname,
        email: inputUser?.email,
      }}
      validationSchema={Yup.object({
        fullname: Yup.string().required(t(IntlKeys.yourProfile.pleaseEnterName)),
        email: Yup.string()
          .email()
          .required(t(IntlKeys.yourProfile.pleaseEnterEmail)),
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
            label={t(IntlKeys.yourProfile.yourEmail)}
            name="email"
            type="text"
            placeholder={t(IntlKeys.yourProfile.yourEmail)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control">
          <Input
            label={t(IntlKeys.yourProfile.yourName)}
            name="fullname"
            type="text"
            placeholder={t(IntlKeys.yourProfile.yourName)}
            className="input input-bordered w-full"
          />
        </div>
      </Form>
    </Formik>
  );
};

export default ProfileForm;
