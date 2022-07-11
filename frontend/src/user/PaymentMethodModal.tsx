import { FunctionComponent, useEffect, useState } from "react";
import {
  PayPalButtons,
  ScriptReducerAction,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  CreateSubscriptionActions,
  CreateOrderData,
  CreateOrderActions,
  OnApproveData,
  OnApproveActions,
} from "@paypal/paypal-js/types/components/buttons";

import "./PaymentMethodModal.scss";
import { useHttp } from "hooks/http";
import CloseCross from "../assets/icons/cross.svg";
import { TRIAL_DAYS } from "../../../shared/constants/subscription-plan";
import { toastError } from "shared/shared.functions";

export interface PaymentMethodModalProps {
  stripePriceId: string;
  closeModal: () => void;
  isNotRecurring?: boolean;
}

const paypalHandlersInitialState = {
  createOrder: undefined,
  createSubscription: undefined,
  onApprove: undefined,
};

const PaymentMethodModal: FunctionComponent<PaymentMethodModalProps> = ({
  stripePriceId,
  closeModal,
  isNotRecurring = false,
}) => {
  const { post } = useHttp();
  const [, setPaypalScriptSettings] = usePayPalScriptReducer();

  const [paypalHandlers, setPaypalHandlers] = useState(
    paypalHandlersInitialState
  );

  useEffect(() => {
    const currentPaypalHandlers = { ...paypalHandlersInitialState };
    const dispatchParams: ScriptReducerAction = {
      type: "resetOptions",
      value: { "client-id": "test", components: "buttons", currency: "EUR" },
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
              priceId: stripePriceId,
            }
          );

          return orderId;
        },
        onApprove: async (data: OnApproveData, actions: OnApproveActions) => {
          const { data: redirectUrl } = await post<string>(
            "/api/billing/capture-paypal-order-payment",
            {
              orderId: data.orderID,
            }
          );

          closeModal();
          window.location.href = redirectUrl || "";
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
              priceId: stripePriceId,
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
          window.location.href = redirectUrl || "";
        },
      });
    }

    setPaypalHandlers(currentPaypalHandlers);
    setPaypalScriptSettings(dispatchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotRecurring]);

  return (
    <div className="payment-methods modal modal-open z-9999">
      <div className="modal-box">
        <div className="modal-header">
          <span>Zahlungsarten</span>
          <img src={CloseCross} alt="close" onClick={() => closeModal()} />
        </div>
        <div className="modal-content">
          <PayPalButtons
            className="paypal-method"
            createOrder={paypalHandlers.createOrder}
            createSubscription={paypalHandlers.createSubscription}
            onApprove={paypalHandlers.onApprove}
            onCancel={() => {
              closeModal();
              toastError("Eine Zahlung wurde storniert.");
            }}
            onError={() => {
              closeModal();
              toastError("Ein Fehler ist aufgetreten.");
            }}
          />
          <div
            className="other-payment-methods"
            onClick={async () => {
              window.location.href = (
                await post<string>("/api/billing/create-checkout-url", {
                  priceId: stripePriceId,
                  trialPeriod: TRIAL_DAYS,
                })
              ).data;
            }}
          >
            Andere Methoden
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
