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
      const { userState } = useContext(UserContext);
  
      const onSubmit = async ({amount}: any) => {
        try {
          beforeSubmit();
          const user : ApiUser = userState.user;
          const priceId = user.subscriptionPlan?.priceIds.requestIncreaseId!;
          const checkoutUrl = (await post<string>('/api/billing/create-checkout-url', {priceId, amount, mode: 'payment'})).data;
          window.location.href = checkoutUrl;
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
  