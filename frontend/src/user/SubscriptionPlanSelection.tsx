import { FunctionComponent, useContext, useEffect, useState } from "react";

import { useHttp } from "hooks/http";
import {
  payPerUse1Subscription,
  payPerUse5Subscription,
  payPerUse10Subscription,
  businessPlusV2Subscription,
  TRIAL_DAYS,
} from "../../../shared/constants/subscription-plan";
import {
  ApiSubscriptionIntervalEnum,
  ApiUserSubscription,
} from "../../../shared/types/subscription-plan";
import { ConfigContext } from "../context/ConfigContext";

interface ISubscriptionPlan {
  stripePriceId: string;
  name: string;
  price: string;
  interval: string;
  description: string[];
}

const SubscriptionPlanSelection: FunctionComponent = () => {
  const { get, post } = useHttp();
  const { stripeEnv } = useContext(ConfigContext);

  const [hadPreviousSubscriptions, setHadPreviousSubscriptions] =
    useState(false);

  const [sortedSubscriptionPlans, setSortedSubscriptionPlans] = useState<
    ISubscriptionPlan[]
  >([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const subscriptions = (
        await get<ApiUserSubscription[]>("/api/users/me/subscriptions")
      ).data;

      setHadPreviousSubscriptions(subscriptions.length > 0);
    };

    fetchSubscriptions();
  }, [get, hadPreviousSubscriptions]);

  useEffect(() => {
    const getIntervalName = (interval: ApiSubscriptionIntervalEnum) => {
      switch (interval) {
        case ApiSubscriptionIntervalEnum.MONTHLY:
          return "Monthly";

        case ApiSubscriptionIntervalEnum.ANNUALLY:
          return "Each year";

        case ApiSubscriptionIntervalEnum.TWELVE_WEEKS:
          return "Each twelve weeks";

        case ApiSubscriptionIntervalEnum.QUARTERLY:
          return "Each quartile";

        default:
          return "Monthly";
      }
    };

    const resultingSubscriptionPlans = [
      payPerUse1Subscription,
      payPerUse5Subscription,
      payPerUse10Subscription,
      businessPlusV2Subscription,
    ].reduce<ISubscriptionPlan[]>(
      (result, { name, prices, description: planDescription = [] }) => {
        prices.forEach(
          ({ id, price, interval, description: priceDescription = [] }) => {
            if (!id[stripeEnv]) {
              return;
            }

            const description = [...priceDescription, ...planDescription];

            result.push({
              stripePriceId: id[stripeEnv]!,
              name,
              price,
              interval: getIntervalName(interval),
              description,
            });
          }
        );

        return result;
      },
      []
    );

    setSortedSubscriptionPlans(resultingSubscriptionPlans);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const forwardToCheckoutUrl = async (priceId: string) => {
    window.location.href = (
      await post<string>("/api/billing/create-checkout-url", {
        priceId,
        trialPeriod: TRIAL_DAYS,
      })
    ).data;
  };

  const SubscriptionPlanCard: FunctionComponent<ISubscriptionPlan> = ({
    stripePriceId,
    name,
    price,
    interval,
    description,
  }) => {
    return (
      <div className="card shadow-lg w-auto flex flex-col justify-center items-center bg-gray-50">
        <div className="card-title w-full">
          <h2 className="p-0 m-0 text-center w-full">{name}</h2>
        </div>
        <div className="card-body py-10">
          <div className="flex justify-center items-baseline">
            <span className="text-4xl font-semibold w-auto">{price} €</span>
            <span className="text-lg ml-2">
              {" "}
              /
              {interval === ApiSubscriptionIntervalEnum.MONTHLY
                ? "Monat "
                : "Jahr "}
              zzgl. USt.
            </span>
          </div>
          {!hadPreviousSubscriptions && (
            <div className="flex justify-end">
              <div className="badge badge-primary">
                {TRIAL_DAYS} Tage kostenfrei testen!
              </div>
            </div>
          )}
          <div className="flex flex-col my-10 h-64">
            <span className="font-semibold">Eigenschaften:</span>
            <ul className="list-disc ml-5 mt-2">
              {description.map((p, i) => (
                <li key={`${i}-${p}`}>{p}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm">
            Wird der Vertrag nicht innerhalb von 14 Tagen nach Vertragsschluss
            gekündigt, geht er in ein reguläres kostenpflichtiges Abonnement mit
            dem gewählten Abonnement-Zeitraum von einem Monat/einem Jahr über.
            Nach Ende des aktuellen Abonnement-Zeitraums verlängert sich die
            Laufzeit des Vertrags automatisch um einen weiteren Monat/ein
            weiteres Jahr, wenn der Nutzer den Vertrag nicht bis zum Ende des
            aktuellen Abonnement-Zeitraums durch Erklärung in Textform gegenüber
            KuDiBa kündigt
          </p>
          {interval === ApiSubscriptionIntervalEnum.MONTHLY && (
            <p className="text-sm">
              Das Abo ist zum Ende des jeweiligen Abonnementzeitraums mit einer
              Frist von 2 Wochen monatlich kündbar.
            </p>
          )}
          {interval === ApiSubscriptionIntervalEnum.ANNUALLY && (
            <p className="text-sm">
              Das Abo ist zum Ende des Abonnementzeitraums mit einer Frist von 2
              Wochen jährlich kündbar.
            </p>
          )}
          <button
            onClick={() => forwardToCheckoutUrl(stripePriceId)}
            className="btn bg-primary-gradient w-56 self-center mt-5"
          >
            Abonnieren
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-20 flex flex-col gap-5">
      <div>
        <h1 className="font-bold text-xl">
          Aktuell besitzen Sie kein aktives Abonnement, bitte wählen Sie das
          passende Abonnement für sich aus.
        </h1>
        {sortedSubscriptionPlans.length && (
          <div
            className={`grid grid-cols-1 ${
              sortedSubscriptionPlans.length === 1
                ? "xl:w-1/2 xl:grid-cols-1"
                : "gap-20 xl:grid-cols-3"
            } mt-20`}
          >
            {sortedSubscriptionPlans.map(
              ({ stripePriceId, name, price, interval, description }) => (
                <SubscriptionPlanCard
                  key={stripePriceId}
                  stripePriceId={stripePriceId}
                  name={name}
                  price={price}
                  interval={interval}
                  description={description}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlanSelection;
