import { FormModalData } from "components/FormModal";
import { useHttp } from "hooks/http";
import { ApiInsertFeedback } from "../../../shared/types/types";
import FeedbackForm from "./FeedbackForm";

export const FeedbackFormHandler: React.FunctionComponent<FormModalData> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
}) => {
  const { post } = useHttp();

  const onSubmit = async ({ description, type }: ApiInsertFeedback) => {
    try {
      beforeSubmit();
      await post("/api/feedback", { description, type });
      postSubmit(true);
    } catch (err) {
      console.log(err);
      postSubmit(false);
    }
  };

  return <FeedbackForm formId={formId!} onSubmit={onSubmit}/>;
};
