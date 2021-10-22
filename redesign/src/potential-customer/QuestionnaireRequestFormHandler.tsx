import { useHttp } from "hooks/http";
import { ApiUpsertQuestionnaireRequest } from "../../../shared/types/potential-customer";
import QuestionnaireRequestForm from "./QuestionnaireRequestForm";
import {FormModalData} from "../components/FormModal";
import { toastError, toastSuccess } from "shared/shared.functions";
import React from "react";

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
        toastSuccess("Fragebogen erfolgreich versandt!");
        postSubmit(true);
      } catch (err) {
        console.log(err);
        toastError("Fehler beim Versenden des Fragebogens");
        postSubmit(false);
      }
    };

    return <QuestionnaireRequestForm formId={formId!} onSubmit={onSubmit} />;
  };

export default QuestionnaireRequestFormHandler;
