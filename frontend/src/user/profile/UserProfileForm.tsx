import { FC } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { FormikProps } from "formik/dist/types";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import Input from "components/inputs/formik/Input";
import { ApiUser } from "../../../../shared/types/types";
import { TFormikInnerRef } from "../../shared/shared.types";

export interface IUserProfileFormData {
  fullname: string;
}

export type TUserProfileFormRef = FormikProps<IUserProfileFormData> | null;

interface IUserProfileFormProps {
  formId: string;
  formRef: TFormikInnerRef<IUserProfileFormData>;
  user: ApiUser;
}

export const UserProfileForm: FC<IUserProfileFormProps> = ({
  formId,
  formRef,
  user,
}) => {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{
        fullname: user.config.fullname!,
        email: user.email,
      }}
      validationSchema={Yup.object({
        fullname: Yup.string().required(
          t(IntlKeys.yourProfile.pleaseEnterName)
        ),
        email: Yup.string()
          .email()
          .required(t(IntlKeys.yourProfile.pleaseEnterEmail)),
      })}
      onSubmit={() => {}}
      innerRef={formRef}
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

export default UserProfileForm;
