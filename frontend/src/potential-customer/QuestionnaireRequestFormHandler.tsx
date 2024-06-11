import { useHttp } from "hooks/http";
import { ApiUpsertQuestionnaireRequest } from "../../../shared/types/potential-customer";
import QuestionnaireRequestForm from "./QuestionnaireRequestForm";
import {FormModalData} from "../components/FormModal";
import { toastError, toastSuccess } from "shared/shared.functions";
import React from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

export const mapFormToApiUpsertQuestionnaireRequest = async (
  values: any
): Promise<ApiUpsertQuestionnaireRequest> => {
  return {
    name: values.name,
    email: values.email,
    userInCopy: values.userInCopy,
  };
};

export const QuestionnaireRequestFormHandler: React.FunctionComponent<FormModalData> =
  ({ formId, beforeSubmit = () => {}, postSubmit = () => {} }) => {
    const { t } = useTranslation();
    const { post } = useHttp();

    const onSubmit = async (values: any) => {
      const mappedPotentialCustomer: ApiUpsertQuestionnaireRequest =
        await mapFormToApiUpsertQuestionnaireRequest(values);

      try {
        beforeSubmit();
        await post(
          "/api/potential-customers/questionnaire-request",
          mappedPotentialCustomer
        );
        toastSuccess(t(IntlKeys.potentialCustomers.customerCreatedSuccess));
        postSubmit(true);
      } catch (err) {
        console.error(err);
        toastError(t(IntlKeys.potentialCustomers.customerCreatedFailed));
        postSubmit(false);
      }
    };

    return <QuestionnaireRequestForm formId={formId!} onSubmit={onSubmit} />;
  };

export default QuestionnaireRequestFormHandler;
