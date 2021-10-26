import { UserActions, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { toastError, toastSuccess } from "shared/shared.functions";
import { ApiUser } from "../../../shared/types/types";
import IncreaseRequestLimitForm from "./IncreaseRequestLimitForm";

export interface IncreaseRequestLimitFormHandlerProps {
    formId?: string;
    beforeSubmit?: () => void;
    postSubmit?: (success: boolean) => void;
  }
  
  const IncreaseRequestLimitFormHandler: React.FunctionComponent<IncreaseRequestLimitFormHandlerProps> =
    ({ formId, beforeSubmit = () => {}, postSubmit = () => {} }) => {
      const { post } = useHttp();
      const history = useHistory();
  
      const { userDispatch } = useContext(UserContext);
  
      const onSubmit = async ({amount}: any) => {
        try {
          beforeSubmit();
          const updatedUser = (await post<ApiUser>("/api/users/me/increase-limit", {amount}))
            .data;
          userDispatch({ type: UserActions.SET_USER, payload: updatedUser });
          toastSuccess("Abfragelimit erfolgreich erhöht!");
          postSubmit(true);
        } catch (err) {
          console.log(err);
          toastError("Fehler bei der Erhöhung des Limits");
          postSubmit(false);
        }
      };
  
      return <IncreaseRequestLimitForm formId={formId!} onSubmit={onSubmit} />;
    };
  
  export default IncreaseRequestLimitFormHandler;
  