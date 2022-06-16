import { FunctionComponent, useContext } from "react";

import { UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { toastError } from "shared/shared.functions";
import { ApiUser } from "../../../shared/types/types";
import IncreaseRequestLimitForm from "./IncreaseRequestLimitForm";
import { ConfigContext } from "../context/ConfigContext";

export interface IncreaseRequestLimitFormHandlerProps {
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
}

const IncreaseRequestLimitFormHandler: FunctionComponent<
  IncreaseRequestLimitFormHandlerProps
> = ({ formId, beforeSubmit = () => {}, postSubmit = () => {} }) => {
  const { post } = useHttp();
  const { userState } = useContext(UserContext);
  const { stripeEnv } = useContext(ConfigContext);
  const user: ApiUser = userState.user!;
  const subscriptionPriceId = user.subscriptionPlan?.priceId;
  const subscriptionPlan = user.subscriptionPlan?.config;

  const currentPrice = subscriptionPlan?.prices.find(
    ({ id }) => id[stripeEnv] === subscriptionPriceId
  );

  const requestIncreaseParams =
    currentPrice?.limits?.numberOfRequests?.increaseParams ||
    subscriptionPlan?.limits?.numberOfRequests?.increaseParams ||
    [];

  const requestIncreasePriceId = requestIncreaseParams[0]?.id[stripeEnv];
  const requestIncreaseAmount = requestIncreaseParams[0]?.amount.value;

  const onSubmit = async ({ amount }: any) => {
    try {
      beforeSubmit();

      window.location.href = (
        await post<string>("/api/billing/create-checkout-url", {
          priceId: requestIncreasePriceId,
          amount,
          mode: "payment",
        })
      ).data;

      postSubmit(true);
    } catch (err) {
      console.log(err);
      toastError("Fehler bei der Erhöhung des Limits");
      postSubmit(false);
    }
  };

  return (
    <IncreaseRequestLimitForm
      formId={formId!}
      onSubmit={onSubmit}
      amount={requestIncreaseAmount!}
    />
  );
};

export default IncreaseRequestLimitFormHandler;
