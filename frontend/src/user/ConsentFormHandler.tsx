import { UserActions, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { toastError } from "shared/shared.functions";
import { ApiUser } from "../../../shared/types/types";
import ConsentForm from "./ConsentForm";

  
  export interface ConstentFormHandlerProps {
    formId?: string;
    beforeSubmit?: () => void;
    postSubmit?: (success: boolean) => void;
  }
  
  const ConstentFormHandler: React.FunctionComponent<ConstentFormHandlerProps> =
    ({ formId, beforeSubmit = () => {}, postSubmit = () => {} }) => {
      const { post } = useHttp();
      const history = useHistory();
  
      const { userDispatch } = useContext(UserContext);
  
      const onSubmit = async (values: any) => {
        try {
          beforeSubmit();
          const updatedUser = (await post<ApiUser>("/api/users/me/consent", {}))
            .data;
          userDispatch({ type: UserActions.SET_USER, payload: updatedUser });
          postSubmit(true);
          history.push('/');
        } catch (err) {
          console.log(err);
          toastError("Fehler bei der Zustimmung");
          postSubmit(false);
        }
      };
  
      return (
        <ConsentForm formId={formId!} onSubmit={onSubmit} />
      );
    };
  
  export default ConstentFormHandler;
  