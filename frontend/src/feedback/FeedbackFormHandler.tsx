import { FunctionComponent, useContext, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { useLocation } from "react-router-dom";

import "./FeedbackFormHandler.scss";
import { FormModalData } from "components/FormModal";
import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { ApiInsertFeedback } from "../../../shared/types/types";
import FeedbackForm from "./FeedbackForm";
import {
  CHATBOT_SCRIPT_ID,
  integrationTourPaths,
  tourPaths,
} from "../shared/shared.constants";

const FeedbackFormHandler: FunctionComponent<FormModalData> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  onClose = () => {},
}) => {
  const { t } = useTranslation();
  const {
    userDispatch,
    userState: { integrationUser },
  } = useContext(UserContext);

  const { pathname } = useLocation();
  const { post } = useHttp();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");
  const resultingTourPaths = integrationUser ? integrationTourPaths : tourPaths;

  useEffect(() => {
    if (!document.head) {
      return;
    }

    const externalScript = document.createElement("script");
    // externalScript.onload = () => {
    //   console.debug("The chat has been loaded!");
    // };
    externalScript.onerror = () => {
      console.error("The error has occurred while using the chat!");
    };
    externalScript.id = CHATBOT_SCRIPT_ID;
    externalScript.async = true;
    externalScript.type = "text/javascript";
    externalScript.src =
      "https://conversations-widget.sendinblue.com/sib-conversations.js";
    // externalScript.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(externalScript);
  }, []);

  const onStartTour = () => {
    userDispatch({ type: UserActionTypes.SET_START_TOUR, payload: true });
    postSubmit(true);
    onClose();
  };

  const onSubmit = async ({ description, type }: ApiInsertFeedback) => {
    try {
      beforeSubmit();
      const content = description + `\n\nURL: ${window.location.href}`;
      await post("/api/feedback", { description: content, type });
      postSubmit(true);
    } catch (err) {
      console.error(err);
      postSubmit(false);
    }
  };

  return (
    <div>
      {resultingTourPaths.includes(currentPath) && (
        <>
          <h1 className="text-lg my-5">
            {t(IntlKeys.snapshotEditor.supportQuestion)}
          </h1>
          <button className="btn btn-primary" onClick={onStartTour}>
            {t(IntlKeys.snapshotEditor.startTour)}
          </button>
        </>
      )}
      <h1 className="text-lg mt-10 mb-5">
        {t(IntlKeys.snapshotEditor.feedbackQuestion)}
      </h1>
      <FeedbackForm formId={formId!} onSubmit={onSubmit} />
    </div>
  );
};

export default FeedbackFormHandler;
