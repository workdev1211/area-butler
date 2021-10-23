import { FunctionComponent } from "react";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { ApiUser } from "../../../shared/types/types";
import {
  allSubscriptions,
  allSubscriptionTypes,
} from "../../../shared/constants/subscription-plan";

export interface SubscriptionPlanLimitsProps {
  user: ApiUser;
  realEstates: ApiRealEstateListing[];
}

const SubscriptionPlanLimits: FunctionComponent<SubscriptionPlanLimitsProps> =
  ({ user, realEstates }) => {
    const subscriptionLabel =
      allSubscriptionTypes.find(
        (item) => user.subscriptionPlan.type === item.type
      )?.label || "Unbekannt";

    return (
      <div className="mt-20 flex flex-col gap-5">
        <div>
          <h1 className="font-bold text-xl">
            Ihre aktuelles Abonnement und Kontingente
          </h1>
          <h3 className="font-bold">
            Aktuelles Abonnement: {subscriptionLabel}
          </h3>
        </div>
        <div
          key="request-contingent"
          className="flex flex-wrap gap-6 items-center"
        >
          <span className="w-64">
            Anfragen ausgeführt {user.requestsExecuted}/{60}:
          </span>
          <progress
            value={user.requestsExecuted}
            max={60}
            className="w-96 progress progress-primary"
          ></progress>
        </div>
        <div
          key="real-estate-contingent"
          className="flex flex-wrap gap-6 items-center"
        >
          <span className="w-64">
            Objekte angelegt {realEstates.length}/
            {user.subscriptionPlan.limits.numberOfRealEstates}:
          </span>
          <progress
            value={realEstates.length}
            max={user.subscriptionPlan.limits.numberOfRealEstates}
            className="w-96 progress progress-primary"
          ></progress>
        </div>
      </div>
    );
  };

export default SubscriptionPlanLimits;
