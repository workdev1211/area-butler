import { FunctionComponent, useContext } from "react";

import { UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { toastError } from "shared/shared.functions";
import { ApiUser } from "../../../shared/types/types";
import { ConfigContext } from "../context/ConfigContext";
import {
  ApiSubscriptionLimitsEnum,
  IApiSubscriptionLimitAmount,
} from "../../../shared/types/subscription-plan";
import IncreaseLimitForm from "./IncreaseLimitForm";

export interface ILimitIncreasePriceId {
  priceId: string;
}

export interface ILimitIncreaseParams {
  priceId: string;
  amount: IApiSubscriptionLimitAmount;
  name?: string;
  description?: string;
}

export interface IIncreaseLimitFormHandlerProps {
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
  limitType: ApiSubscriptionLimitsEnum;
  // TODO change to enum or whatever
  modelName?: string;
  modelId?: string;
}

const IncreaseLimitFormHandler: FunctionComponent<
  IIncreaseLimitFormHandlerProps
> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  limitType,
  modelName,
  modelId,
}) => {
  const { post } = useHttp();
  const { userState } = useContext(UserContext);
  const { stripeEnv } = useContext(ConfigContext);
  const user: ApiUser = userState.user!;
  const subscriptionPriceId = user.subscriptionPlan?.priceId;
  const subscriptionPlan = user.subscriptionPlan?.config;

  const currentPrice = subscriptionPlan?.prices.find(
    ({ id }) => id[stripeEnv] === subscriptionPriceId
  );

  const limitIncreaseParams =
    currentPrice?.limits?.[limitType]?.increaseParams ||
    subscriptionPlan?.limits?.[limitType]?.increaseParams ||
    [];

  let label: string;
  let description: string;

  const filteredParams = limitIncreaseParams.reduce<ILimitIncreaseParams[]>(
    (result, { id, amount, name, description: limitDescription }) => {
      if (id[stripeEnv]) {
        result.push({ priceId: id[stripeEnv]!, amount });
        label = name;
        description = limitDescription;
      }

      return result;
    },
    []
  );

  const onSubmit = async ({ priceId }: ILimitIncreasePriceId) => {
    try {
      beforeSubmit();

      const selectedParams = filteredParams.find(
        (param) => param.priceId === priceId
      );

      window.location.href = (
        await post<string>("/api/billing/create-checkout-url", {
          priceId,
          amount: selectedParams?.amount.value,
          metadata: modelName && modelId ? { modelName, modelId } : undefined,
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

  return filteredParams.length ? (
    <IncreaseLimitForm
      formId={formId!}
      onSubmit={onSubmit}
      limitIncreaseParams={filteredParams}
      label={label!}
      description={description!}
    />
  ) : null;
};

export default IncreaseLimitFormHandler;
