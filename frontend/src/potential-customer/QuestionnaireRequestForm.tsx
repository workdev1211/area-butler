import { FunctionComponent } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import Input from "../components/inputs/formik/Input";
import Checkbox from "../components/inputs/formik/Checkbox";

interface IQuestionnaireRequestFormProps {
  formId: string;
  onSubmit: (values: any) => any;
}

export const QuestionnaireRequestForm: FunctionComponent<
  IQuestionnaireRequestFormProps
> = ({ formId, onSubmit }) => {
  const { t } = useTranslation();
  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        userInCopy: true,
        userAgreement: false,
      }}
      validationSchema={Yup.object({
        name: Yup.string().required(t(IntlKeys.potentialCustomers.pleaseEnterName)),
        email: Yup.string()
          .email()
          .required(t(IntlKeys.potentialCustomers.pleaseEnterEmail)),
        preferredLocations: Yup.array(),
        userAgreement: Yup.boolean().oneOf([true], t(IntlKeys.potentialCustomers.approvalIsRequired)),
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
            label={t(IntlKeys.potentialCustomers.nameTitle)}
            name="name"
            type="text"
            placeholder={t(IntlKeys.common.name)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control">
          <Input
            label={t(IntlKeys.potentialCustomers.emailTitle)}
            name="email"
            type="text"
            placeholder={t(IntlKeys.common.email)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control my-5">
          <Checkbox name="userInCopy">
            {t(IntlKeys.potentialCustomers.sentCopyEmail)}
          </Checkbox>
        </div>
        <p>
          {t(IntlKeys.potentialCustomers.whatHappenWhenYouClick)} <strong>{t(IntlKeys.common.send)}</strong>?
        </p>
        <ul className="list-decimal m-5 flex flex-col gap-3 text-sm">
          <li>
            {t(IntlKeys.potentialCustomers.questionnaireText1)}
          </li>
          <li>
            {t(IntlKeys.potentialCustomers.questionnaireText2)}
          </li>
          <li>
            {t(IntlKeys.potentialCustomers.questionnaireText3)}
          </li>
          <li>
            {t(IntlKeys.potentialCustomers.questionnaireText4)}
          </li>
        </ul>
        <p className="text-sm">
          {t(IntlKeys.potentialCustomers.questionnaireText5)}
        </p>
        <div className="form-control my-5">
          <Checkbox name="userAgreement">
            {t(IntlKeys.potentialCustomers.customerAgreesToReceive)}
          </Checkbox>
        </div>
      </Form>
    </Formik>
  );
};

export default QuestionnaireRequestForm;
