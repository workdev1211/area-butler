import { FunctionComponent, useContext, useState } from "react";

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
import {
  ApiStripeCheckoutModeEnum,
  ILimitIncreaseMetadata,
  LimitIncreaseModelNameEnum,
} from "../../../shared/types/billing";
import PaymentMethodModal from "./PaymentMethodModal";

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
  modelName?: LimitIncreaseModelNameEnum;
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

  const [paymentStripePriceId, setPaymentStripePriceId] = useState("");
  const [isShownPaymentModal, setIsShownPaymentModal] = useState(false);
  const [paymentMetadata, setPaymentMetadata] =
    useState<ILimitIncreaseMetadata>();
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState(
    process.env.REACT_APP_BASE_URL || ""
  );

  const { userState } = useContext(UserContext);
  const { stripeEnv } = useContext(ConfigContext);

  const user: ApiUser = userState.user!;
  const subscriptionPriceId = user.subscription?.priceId;
  const subscriptionPlan = user.subscription?.config;

  const currentPrice = subscriptionPlan?.prices.find(
    ({ id }) => id[stripeEnv] === subscriptionPriceId
  );

  const limitIncreaseParams =
    currentPrice?.limits?.[limitType]?.increaseParams ||
    subscriptionPlan?.limits?.[limitType]?.increaseParams ||
    [];

  const filteredParams = limitIncreaseParams.reduce<ILimitIncreaseParams[]>(
    (result, { id, amount, name, description }) => {
      if (id[stripeEnv]) {
        result.push({ priceId: id[stripeEnv]!, amount, name, description });
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

      const metadata =
        modelName && modelId ? { modelName, modelId } : undefined;

      setStripeCheckoutUrl(
        (
          await post<string>("/api/billing/create-checkout-url", {
            priceId,
            amount: selectedParams?.amount.value,
            metadata,
            mode: ApiStripeCheckoutModeEnum.Payment,
          })
        ).data
      );

      setPaymentStripePriceId(priceId);
      setPaymentMetadata(metadata);
      setIsShownPaymentModal(true);
    } catch (err) {
      console.log(err);
      toastError("Fehler bei der Erhöhung des Limits");
      postSubmit(false);
    }
  };

  return filteredParams.length ? (
    <>
      {isShownPaymentModal && (
        <PaymentMethodModal
          priceId={paymentStripePriceId}
          closeModal={() => {
            setIsShownPaymentModal(false);
            postSubmit(true);
          }}
          stripeCheckoutUrl={stripeCheckoutUrl}
          isNotRecurring={true}
          paymentMetadata={paymentMetadata}
        />
      )}
      <IncreaseLimitForm
        formId={formId!}
        onSubmit={onSubmit}
        limitIncreaseParams={filteredParams}
      />
    </>
  ) : null;
};

export default IncreaseLimitFormHandler;
