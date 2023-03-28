import { FunctionComponent } from "react";

import FormModal from "./FormModal";
import { feedbackModalConfig } from "../shared/shared.constants";
import FeedbackFormHandler from "../feedback/FeedbackFormHandler";

const FeedbackModal: FunctionComponent = () => {
  return (
    <FormModal modalConfig={feedbackModalConfig}>
      <FeedbackFormHandler />
    </FormModal>
  );
};

export default FeedbackModal;
