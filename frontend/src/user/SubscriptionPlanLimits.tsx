import { FunctionComponent, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { ApiUser } from "../../../shared/types/types";
import { allSubscriptionTypes } from "../../../shared/constants/subscription-plan";
import RequestContingentDropDown from "./RequestContingentDropdown";
import { deriveTotalRequestContingent } from "shared/shared.functions";
import { useHttp } from "hooks/http";
import {
  ApiSubscriptionPlanType,
  PaymentSystemTypeEnum,
} from "../../../shared/types/subscription-plan";
import { ConfigContext } from "../context/ConfigContext";
import ConfirmationModal from "../components/ConfirmationModal";
import { UserActionTypes, UserContext } from "../context/UserContext";

export interface SubscriptionPlanLimitsProps {
  user: ApiUser;
}

const SubscriptionPlanLimits: FunctionComponent<
  SubscriptionPlanLimitsProps
> = ({ user }) => {
  const { stripeEnv } = useContext(ConfigContext);
  const { userDispatch } = useContext(UserContext);
  const history = useHistory();
  const { post, deleteRequest } = useHttp();

  const [isShownModal, setIsShownModal] = useState(false);

  const subscription = user.subscription;
  const subscriptionLabel =
    allSubscriptionTypes.find((item) => subscription?.type === item.type)
      ?.name || "Unbekannt";
  const totalRequestContingent = deriveTotalRequestContingent(user);

  const cancelTrialSubscription = async () => {
    const user: ApiUser = (
      await deleteRequest<ApiUser>("/api/users/me/cancel-trial")
    ).data;

    userDispatch({ type: UserActionTypes.SET_USER, payload: user });
    history.go(0);
  };

  const forwardToCustomerPortal = async () => {
    switch (subscription?.paymentSystemType) {
      case PaymentSystemTypeEnum.STRIPE: {
        window.location.href = (
          await post<string>("/api/billing/create-customer-portal-link", {})
        ).data;
        break;
      }

      case PaymentSystemTypeEnum.PAYPAL: {
        window.open(
          `https://${
            stripeEnv === "dev" ? "sandbox." : ""
          }paypal.com/myaccount/autopay/`,
          "_blank"
        );
        break;
      }
    }
  };

  return (
    <>
      <ConfirmationModal
        isShownModal={isShownModal}
        closeModal={() => {
          setIsShownModal(false);
        }}
        onConfirm={cancelTrialSubscription}
        text="Gehen Sie zur kommerziellen Nutzung?"
      />

      <div className="mt-20 flex flex-col gap-5">
        <div>
          <h1 className="font-bold text-xl">
            Ihr aktuelles Abonnement und Ihre Kontingente
          </h1>
          <h3 className="font-bold">
            Aktuelles Abonnement: {subscriptionLabel}
          </h3>
          {Object.values<string>(PaymentSystemTypeEnum).includes(
            `${subscription?.paymentSystemType}`
          ) && (
            <button
              onClick={async () => {
                await forwardToCustomerPortal();
              }}
              className="btn bg-primary-gradient btn-primary"
              data-tour="manage-subscription"
            >
              Zahlung und Abonnement verwalten
            </button>
          )}
          {subscription?.type === ApiSubscriptionPlanType.TRIAL && (
            <button
              onClick={() => {
                setIsShownModal(true);
              }}
              className="btn bg-primary-gradient btn-primary"
              data-tour="manage-subscription"
            >
              Zur gewerblichen Nutzung
            </button>
          )}
        </div>
        <div
          key="request-contingent"
          className="flex flex-wrap gap-6 items-center"
          data-tour="request-contingent"
        >
          <span className="w-64 flex items-center">
            Anfragen ausgeführt {user.requestsExecuted}/{totalRequestContingent}
            :
            <RequestContingentDropDown
              requestContingents={user.requestContingents}
            />
          </span>
          <progress
            value={user.requestsExecuted}
            max={totalRequestContingent}
            className="w-96 progress progress-primary"
          />
        </div>
        <div
          key="real-estate-contingent"
          className="flex flex-wrap gap-6 items-center"
        >
          <div>Unlimitierte Objekte</div>
        </div>
        <div
          key="customer-contingent"
          className="flex flex-wrap gap-6 items-center"
        >
          <div>Unlimitierte Interessenten</div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPlanLimits;
