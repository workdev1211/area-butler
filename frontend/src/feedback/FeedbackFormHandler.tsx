import { FormModalData } from "components/FormModal";
import { UserActions, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { useContext } from "react";
import { ApiInsertFeedback } from "../../../shared/types/types";
import FeedbackForm from "./FeedbackForm";

const FeedbackFormHandler: React.FunctionComponent<FormModalData> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
}) => {
  const { post } = useHttp();

  const { userDispatch } = useContext(UserContext);

  const onStartTour = () => {
    userDispatch({ type: UserActions.SET_START_TOUR, payload: true });
    postSubmit(true);
  };

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

  return (
    <div>
      <h1 className="text-lg my-5">Dürfen wir unterstützen?</h1>
      <button className="btn btn-primary" onClick={() => onStartTour()}>
        Tour starten
      </button>
      <h1 className="text-lg mt-10 mb-5">Liegt etwas auf dem Herzen?</h1>
      <FeedbackForm formId={formId!} onSubmit={onSubmit} />
    </div>
  );
};

export default FeedbackFormHandler;
