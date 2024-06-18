import { FunctionComponent, useContext, useState } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

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

dayjs.extend(utc);
dayjs.extend(timezone);

export interface SubscriptionPlanLimitsProps {
  user: ApiUser;
}

const SubscriptionPlanLimits: FunctionComponent<
  SubscriptionPlanLimitsProps
> = ({ user }) => {
  const { t } = useTranslation();
  const { stripeEnv } = useContext(ConfigContext);
  const { userDispatch } = useContext(UserContext);
  const history = useHistory();
  const { post, deleteRequest } = useHttp();

  const [isShownModal, setIsShownModal] = useState(false);

  const subscription = user.subscription;
  const subscriptionLabel =
    allSubscriptionTypes.find((item) => subscription?.type === item.type)
      ?.name || t(IntlKeys.common.unknown);
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
      {isShownModal && (
        <ConfirmationModal
          text={t(IntlKeys.yourProfile.endTestAndSelectPlan)}
          closeModal={() => {
            setIsShownModal(false);
          }}
          onConfirm={cancelTrialSubscription}
        />
      )}

      <div className="mt-20 flex flex-col gap-5">
        <div>
          <h1 className="font-bold text-xl">
            {t(IntlKeys.yourProfile.yourCurrentPlan)}
          </h1>
          <h3 className="font-bold">
            {t(IntlKeys.yourProfile.currentPlan)}: {subscriptionLabel} bis{" "}
            {dayjs(user?.subscription?.endsAt)
              .tz("Europe/Berlin")
              .format("DD-MM-YYYY HH:mm")}
          </h3>
          {Object.values<string>(PaymentSystemTypeEnum).includes(
            `${subscription?.paymentSystemType}`
          ) && (
            <button
              onClick={() => forwardToCustomerPortal()}
              className="btn bg-primary-gradient btn-primary"
              data-tour="manage-subscription"
            >
              {t(IntlKeys.yourProfile.managePaymentAndSubscription)}
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
              {t(IntlKeys.yourProfile.endTestAndSelectPlanBtn)}
            </button>
          )}
        </div>
        <div
          key="request-contingent"
          className="flex flex-wrap gap-6 items-center"
          data-tour="request-contingent"
        >
          <span className="w-64 flex items-center">
            {t(IntlKeys.yourProfile.requestExecuted)} {user.requestsExecuted}/{totalRequestContingent}
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
      </div>
    </>
  );
};

export default SubscriptionPlanLimits;
