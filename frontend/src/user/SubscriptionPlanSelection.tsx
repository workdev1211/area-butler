import { FunctionComponent, useContext, useEffect, useState } from "react";

import "./SubscriptionPlanSelection.scss";
import { useHttp } from "hooks/http";
import {
  businessPlusV2Subscription,
  payPerUse10Subscription,
  payPerUse1Subscription,
  payPerUse5Subscription,
  TRIAL_DAYS,
} from "../../../shared/constants/subscription-plan";
import {
  ApiSubscriptionPlanType,
  ApiSubscriptionPlanTypeGroupEnum,
  ApiUserSubscription,
} from "../../../shared/types/subscription-plan";
import { ConfigContext } from "../context/ConfigContext";
import PaymentMethodModal from "./PaymentMethodModal";

interface ISubscriptionPlan {
  stripePriceId: string;
  name: string;
  price: string;
  vatStatus?: string;
  description: string[];
  footnote?: string;
  purchaseButtonLabel?: string;
}

type TSubscriptionPlanGroups = {
  [key in ApiSubscriptionPlanTypeGroupEnum]: ISubscriptionPlan[];
};

const SubscriptionPlanSelection: FunctionComponent = () => {
  const { get, post } = useHttp();
  const { stripeEnv } = useContext(ConfigContext);

  const [hadPreviousSubscriptionPlans, setHadPreviousSubscriptionPlans] =
    useState(false);

  const [sortedSubscriptionPlans, setSortedSubscriptionPlans] =
    useState<TSubscriptionPlanGroups>({
      [ApiSubscriptionPlanTypeGroupEnum.PayPerUse]: [],
      [ApiSubscriptionPlanTypeGroupEnum.BusinessPlus]: [],
    });

  const [activeSubscriptionGroup, setActiveSubscriptionGroup] = useState(
    ApiSubscriptionPlanTypeGroupEnum.PayPerUse
  );

  const [isMounted, setIsMounted] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);
  const [isShownPaymentModal, setIsShownPaymentModal] = useState(false);
  const [paymentStripePriceId, setPaymentStripePriceId] = useState("");
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState("");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isMounted && !shouldRender) {
      setShouldRender(true);
    } else if (!isMounted && shouldRender) {
      timeoutId = setTimeout(() => setShouldRender(false), 500);
    }

    return () => clearTimeout(timeoutId);
  }, [isMounted, shouldRender]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const subscriptions = (
        await get<ApiUserSubscription[]>("/api/users/me/subscriptions")
      ).data;

      setHadPreviousSubscriptionPlans(subscriptions.length > 0);
    };

    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hadPreviousSubscriptionPlans]);

  useEffect(() => {
    const getSubscriptionGroup = (
      type: ApiSubscriptionPlanType
    ): ApiSubscriptionPlanTypeGroupEnum => {
      switch (type) {
        case ApiSubscriptionPlanType.BUSINESS_PLUS_V2: {
          return ApiSubscriptionPlanTypeGroupEnum.BusinessPlus;
        }

        default: {
          return ApiSubscriptionPlanTypeGroupEnum.PayPerUse;
        }
      }
    };

    const resultingSubscriptionPlans = [
      payPerUse1Subscription,
      payPerUse5Subscription,
      payPerUse10Subscription,
      businessPlusV2Subscription,
    ].reduce<TSubscriptionPlanGroups>(
      (
        result,
        {
          name: planName,
          prices,
          description: planDescription = [],
          type,
          footnote: planFootnote,
          purchaseButtonLabel: planButtonLabel,
        }
      ) => {
        prices.forEach(
          ({
            id,
            name: priceName,
            price,
            vatStatus,
            description: priceDescription = [],
            footnote: priceFootnote,
            purchaseButtonLabel: priceButtonLabel,
          }) => {
            if (!id[stripeEnv]) {
              return;
            }

            const description = [...priceDescription, ...planDescription];

            result[getSubscriptionGroup(type)].push({
              stripePriceId: id[stripeEnv]!,
              name: priceName || planName,
              price,
              vatStatus,
              description,
              footnote: priceFootnote || planFootnote,
              purchaseButtonLabel: priceButtonLabel || planButtonLabel,
            });
          }
        );

        return result;
      },
      {
        [ApiSubscriptionPlanTypeGroupEnum.PayPerUse]: [],
        [ApiSubscriptionPlanTypeGroupEnum.BusinessPlus]: [],
      } as TSubscriptionPlanGroups
    );

    setSortedSubscriptionPlans(resultingSubscriptionPlans);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getStripeCheckoutUrl = async () => {
      const innerStripeCheckoutUrl = (
        await post<string>("/api/billing/create-checkout-url", {
          priceId: paymentStripePriceId,
          trialPeriod: TRIAL_DAYS,
        })
      ).data;

      setStripeCheckoutUrl(innerStripeCheckoutUrl);
    };

    if (paymentStripePriceId) {
      getStripeCheckoutUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStripePriceId]);

  const SubscriptionPlanCard: FunctionComponent<ISubscriptionPlan> = ({
    stripePriceId,
    name,
    price,
    vatStatus,
    description,
    footnote,
    purchaseButtonLabel,
  }) => {
    return (
      <div className="card shadow-lg w-auto flex flex-col justify-center items-center bg-gray-50">
        <div className="card-title w-full">
          <h2 className="p-0 m-0 text-center w-full">{name}</h2>
        </div>
        <div className="card-body py-10">
          <div className="flex justify-center items-baseline">
            <span className="text-4xl font-semibold w-auto">
              {price} €<sup>*</sup>
            </span>
            {vatStatus && <span className="text-lg ml-2"> / {vatStatus}</span>}
          </div>
          {!hadPreviousSubscriptionPlans && (
            <div className="flex justify-end">
              <div className="badge badge-primary">
                {TRIAL_DAYS} Tage kostenfrei testen!
              </div>
            </div>
          )}
          <div className="flex flex-col my-10 h-64">
            <span className="font-semibold">Beinhaltet:</span>
            <ul className="list-disc ml-5 mt-2">
              {description.map((p, i) => (
                <li key={`${i}-${p}`}>{p}</li>
              ))}
            </ul>
          </div>
          {footnote && (
            <p
              className="text-sm text-justify"
              dangerouslySetInnerHTML={{ __html: footnote }}
            />
          )}
          <button
            onClick={() => {
              setPaymentStripePriceId(stripePriceId);
              setIsShownPaymentModal(true);
            }}
            className="btn bg-primary-gradient w-56 self-center mt-5"
          >
            {purchaseButtonLabel || "Abonnieren"}
          </button>
        </div>
      </div>
    );
  };

  const mountedStyle = { animation: "inAnimation 500ms ease-in" };
  const unmountedStyle = { animation: "outAnimation 500ms ease-in" };
  const numberOfSubscriptionPlans =
    sortedSubscriptionPlans[activeSubscriptionGroup].length;
  let cardContainerClassNames = "grid grid-cols-1 mt-20";

  if ([1, 2].includes(numberOfSubscriptionPlans)) {
    cardContainerClassNames +=
      numberOfSubscriptionPlans === 1
        ? " xl:w-1/2 xl:grid-cols-1"
        : ` gap-40 xl:grid-cols-2`;
  } else {
    cardContainerClassNames += ` gap-20 xl:grid-cols-3`;
  }

  return (
    <div className="mt-20 flex flex-col gap-5">
      {isShownPaymentModal && (
        <PaymentMethodModal
          stripePriceId={paymentStripePriceId}
          closeModal={() => {
            setIsShownPaymentModal(false);
          }}
          stripeCheckoutUrl={stripeCheckoutUrl}
        />
      )}
      <div>
        <h1 className="font-bold text-xl">
          Aktuell ist Ihr Kontingent aufgebraucht oder Sie besitzen kein aktives
          Abonnement, bitte wählen Sie das Passende für sich aus:
        </h1>
        <div className="p-20 flex flex-col items-center justify-center">
          <h2>Einzelabfragen oder Abo</h2>
          <div className="btn-group mt-5">
            {Object.entries(sortedSubscriptionPlans).map(
              ([subscriptionGroupName, subscriptionPlans]) => {
                if (subscriptionPlans.length) {
                  return (
                    <button
                      className={`btn btn-lg ${
                        activeSubscriptionGroup === subscriptionGroupName
                          ? "btn-active"
                          : ""
                      }`}
                      onClick={() => {
                        setIsMounted(!isMounted);
                        setActiveSubscriptionGroup(
                          subscriptionGroupName as ApiSubscriptionPlanTypeGroupEnum
                        );
                      }}
                      key={subscriptionGroupName}
                    >
                      {subscriptionGroupName}
                    </button>
                  );
                }

                return null;
              }
            )}
          </div>
          <div style={isMounted ? mountedStyle : unmountedStyle}>
            {sortedSubscriptionPlans[activeSubscriptionGroup].length && (
              <div className={cardContainerClassNames}>
                {sortedSubscriptionPlans[activeSubscriptionGroup].map(
                  (
                    {
                      stripePriceId,
                      name,
                      price,
                      vatStatus,
                      description,
                      footnote,
                      purchaseButtonLabel,
                    },
                    i
                  ) => (
                    <SubscriptionPlanCard
                      key={stripePriceId}
                      stripePriceId={stripePriceId}
                      name={name}
                      price={price}
                      vatStatus={vatStatus}
                      description={description}
                      footnote={footnote}
                      purchaseButtonLabel={purchaseButtonLabel}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanSelection;
