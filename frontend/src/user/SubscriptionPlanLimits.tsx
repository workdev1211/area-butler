import {FunctionComponent} from "react";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import {ApiUser} from "../../../shared/types/types";
import {allSubscriptionTypes,} from "../../../shared/constants/subscription-plan";
import RequestContingentDropDown from "./RequestContingentDropdown";
import {deriveTotalRequestContingent} from "shared/shared.functions";
import {useHttp} from "hooks/http";
import {ApiPotentialCustomer} from "../../../shared/types/potential-customer";

export interface SubscriptionPlanLimitsProps {
  user: ApiUser;
  realEstates: ApiRealEstateListing[];
  customers: ApiPotentialCustomer[];
}

const SubscriptionPlanLimits: FunctionComponent<SubscriptionPlanLimitsProps> =
  ({ user, realEstates, customers }) => {

    const subscriptionLabel =
      allSubscriptionTypes.find(
        (item) => user.subscriptionPlan?.type === item.type
      )?.label || "Unbekannt";

    const totalRequestContingent = deriveTotalRequestContingent(user);

    const { post } = useHttp();

    const forwardToCustomerPortal = async () => {
        window.location.href = (
          await post<string>("/api/billing/create-customer-portal-link", {})
      ).data;
    };

    return (
      <div className="mt-20 flex flex-col gap-5">
        <div>
          <h1 className="font-bold text-xl">
            Ihr aktuelles Abonnement und Ihre Kontingente
          </h1>
          <h3 className="font-bold">
            Aktuelles Abonnement: {subscriptionLabel}
          </h3>
          <button
            onClick={() => forwardToCustomerPortal()}
            className="btn bg-primary-gradient btn-primary"
            data-tour="manage-subscription"
          >
            Zahlung und Abonnement verwalten
          </button>
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
            ></RequestContingentDropDown>
          </span>
          <progress
            value={user.requestsExecuted}
            max={totalRequestContingent}
            className="w-96 progress progress-primary"
          ></progress>
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
    );
  };

export default SubscriptionPlanLimits;
