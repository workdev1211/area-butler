import { FormModalData } from "components/FormModal";
import { useHttp } from "hooks/http";
import { ApiUpsertQuestionnaireRequest } from "../../../shared/types/potential-customer";
import QuestionnaireRequestForm from "./QuestionnaireRequestForm";

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

        postSubmit(true);
      } catch (err) {
        console.log(err);
        postSubmit(false);
      }
    };

    return <QuestionnaireRequestForm formId={formId!} onSubmit={onSubmit} />;
  };

export default QuestionnaireRequestFormHandler;
