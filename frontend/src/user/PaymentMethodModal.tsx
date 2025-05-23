import { FunctionComponent, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  PayPalButtons,
  ScriptReducerAction,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  CreateOrderActions,
  CreateOrderData,
  CreateSubscriptionActions,
  OnApproveActions,
  OnApproveData,
} from "@paypal/paypal-js/types/components/buttons";

import { useHttp } from "hooks/http";
import closeIcon from "../assets/icons/cross.svg";
import { toastError } from "shared/shared.functions";
import { ILimitIncreaseMetadata } from "../../../shared/types/billing";
import { ConfigContext } from "../context/ConfigContext";
import { commonPaypalOptions } from "../shared/shared.constants";

interface PaymentMethodModalProps {
  priceId: string;
  closeModal: () => void;
  isNotRecurring?: boolean;
  stripeCheckoutUrl: string;
  paymentMetadata?: ILimitIncreaseMetadata;
}

const paypalHandlersInitialState = {
  createOrder: undefined,
  createSubscription: undefined,
  onApprove: undefined,
};

const PaymentMethodModal: FunctionComponent<PaymentMethodModalProps> = ({
  priceId,
  closeModal,
  isNotRecurring = false,
  stripeCheckoutUrl,
  paymentMetadata,
}) => {
  const { t } = useTranslation();
  const { paypalClientId } = useContext(ConfigContext);
  const { post } = useHttp();
  const [paypalScriptSetting, setPaypalScriptSettings] =
    usePayPalScriptReducer();

  const [wasPaypalSetup, setWasPaypalSetup] = useState(false);
  const [hasPaypalLoaded, setHasPaypalLoaded] = useState(false);
  const [paypalHandlers, setPaypalHandlers] = useState(
    paypalHandlersInitialState
  );

  useEffect(() => {
    const currentPaypalHandlers = { ...paypalHandlersInitialState };
    const dispatchParams: ScriptReducerAction = {
      type: "resetOptions",
      value: {
        "client-id": paypalClientId || "test",
        ...commonPaypalOptions,
      },
    };

    if (isNotRecurring) {
      dispatchParams.value = { ...dispatchParams.value, intent: "capture" };

      Object.assign(currentPaypalHandlers, {
        createOrder: async (
          data: CreateOrderData,
          actions: CreateOrderActions
        ) => {
          const { data: orderId } = await post<string>(
            "/api/billing/create-paypal-order",
            {
              priceId,
            }
          );

          return orderId;
        },
        onApprove: async (data: OnApproveData, actions: OnApproveActions) => {
          const { data: redirectUrl } = await post<string>(
            "/api/billing/capture-paypal-order-payment",
            {
              orderId: data.orderID,
              metadata: paymentMetadata,
            }
          );

          closeModal();
          window.location.href = redirectUrl;
        },
      });
    } else {
      dispatchParams.value = {
        ...dispatchParams.value,
        intent: "subscription",
        vault: true,
      };

      Object.assign(currentPaypalHandlers, {
        createSubscription: async (
          data: Record<string, unknown>,
          actions: CreateSubscriptionActions
        ) => {
          const { data: orderId } = await post<string>(
            "/api/billing/create-paypal-subscription",
            {
              priceId,
            }
          );

          return orderId;
        },
        onApprove: async (data: OnApproveData, actions: OnApproveActions) => {
          const { data: redirectUrl } = await post<string>(
            "/api/billing/approve-paypal-subscription",
            {
              subscriptionId: data.subscriptionID,
            }
          );

          closeModal();
          window.location.href = redirectUrl;
        },
      });
    }

    setPaypalHandlers(currentPaypalHandlers);
    setPaypalScriptSettings(dispatchParams);
    setWasPaypalSetup(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotRecurring]);

  useEffect(() => {
    // @ts-ignore
    if (paypalScriptSetting.loadingStatus === "resolved" && wasPaypalSetup) {
      setHasPaypalLoaded(true);
      setWasPaypalSetup(false);
    }

    // @ts-ignore
  }, [wasPaypalSetup, paypalScriptSetting.loadingStatus]);

  if (!hasPaypalLoaded) {
    return null;
  }

  return (
    <div className="modal modal-open z-9000 backdrop-blur-sm">
      <div className="modal-box p-0 sm:rounded-2xl">
        <div
          className="flex justify-between px-6 py-3 rounded-t-2xl text-white"
          style={{ background: "var(--primary)" }}
        >
          <span className="text-lg font-medium">
            {t(IntlKeys.realEstate.paymentMethods)}
          </span>
          <img
            className="cursor-pointer invert"
            src={closeIcon}
            alt="close"
            onClick={closeModal}
          />
        </div>
        <div className="flex flex-col gap-3 p-6">
          <div
            className="text-xl font-bold btn-primary rounded-md flex items-center justify-center shadow-lg cursor-pointer"
            style={{
              height: "40px",
              backgroundColor: "rgb(132 204 22)",
            }}
            onClick={() => {
              window.location.href = stripeCheckoutUrl;
            }}
          >
            {t(IntlKeys.subscriptions.creditCard)}
          </div>
          <PayPalButtons
            className="flex items-center"
            createOrder={paypalHandlers.createOrder}
            createSubscription={paypalHandlers.createSubscription}
            onApprove={paypalHandlers.onApprove}
            onCancel={() => {
              closeModal();
              toastError(t(IntlKeys.subscriptions.paymentCanceled));
            }}
            onError={() => {
              closeModal();
              toastError(t(IntlKeys.snapshotEditor.dataTab.errorOccurred));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
