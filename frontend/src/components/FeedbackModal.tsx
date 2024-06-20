import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import FormModal from "./FormModal";
import { feedbackModalConfig } from "../shared/shared.constants";
import FeedbackFormHandler from "../feedback/FeedbackFormHandler";

const FeedbackModal: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <FormModal
      modalConfig={{
        ...feedbackModalConfig,
        modalTitle: t(IntlKeys.snapshotEditor.helpAndFeedback),
      }}
    >
      <FeedbackFormHandler />
    </FormModal>
  );
};

export default FeedbackModal;
