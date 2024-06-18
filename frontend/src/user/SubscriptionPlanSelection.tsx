import { FunctionComponent, useContext, useEffect, useState } from "react";

import "./SubscriptionPlanSelection.scss";
import { useHttp } from "hooks/http";
import {
  businessPlusV2Subscription,
  payPerUse10Subscription,
  payPerUse1Subscription,
  stripeSubscriptionsCheckoutMode,
} from "../../../shared/constants/subscription-plan";
import {
  ApiSubscriptionPlanType,
  ApiSubscriptionPlanTypeGroupEnum,
} from "../../../shared/types/subscription-plan";
import { ConfigContext } from "../context/ConfigContext";
import PaymentMethodModal from "./PaymentMethodModal";
import {
  ApiCreateCheckout,
  ApiStripeCheckoutModeEnum,
} from "../../../shared/types/billing";
import {
  BusinessPlusMonthlyDescription,
  BusinessPlusYearlyDescription,
  PayPerUse10Description,
  PayPerUse1Description,
} from "./SubscriptionDescriptions";

type TSubscriptionPlanGroups = {
  [key in ApiSubscriptionPlanTypeGroupEnum]: ISubscriptionPlan[];
};

interface ISubscriptionPlan {
  stripeCheckoutMode: ApiStripeCheckoutModeEnum;
  stripePriceId: string;
  description: JSX.Element;
  purchaseButtonLabel?: string;
}

export const getPlanPriceDescription = (priceId: string): JSX.Element => {
  if (
    Object.values(businessPlusV2Subscription.prices[0].id).includes(priceId)
  ) {
    //TODO translate them
    return <BusinessPlusMonthlyDescription />;
  }

  if (
    Object.values(businessPlusV2Subscription.prices[1].id).includes(priceId)
  ) {
    return <BusinessPlusYearlyDescription />;
  }

  if (Object.values(payPerUse1Subscription.prices[0].id).includes(priceId)) {
    return <PayPerUse1Description />;
  }

  return <PayPerUse10Description />;
};

const SubscriptionPlanSelection: FunctionComponent = () => {
  const { post } = useHttp();
  const { stripeEnv } = useContext(ConfigContext);

  const [sortedSubscriptionPlans, setSortedSubscriptionPlans] =
    useState<TSubscriptionPlanGroups>({
      [ApiSubscriptionPlanTypeGroupEnum.PAY_PER_USE]: [],
      [ApiSubscriptionPlanTypeGroupEnum.BUSINESS_PLUS]: [],
    });

  const [activeSubscriptionGroup, setActiveSubscriptionGroup] = useState(
    ApiSubscriptionPlanTypeGroupEnum.PAY_PER_USE
  );

  const [isMounted, setIsMounted] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);
  const [isShownPaymentModal, setIsShownPaymentModal] = useState(false);
  const [paymentStripePriceId, setPaymentStripePriceId] = useState("");
  const [paymentStripeCheckoutMode, setPaymentStripeCheckoutMode] = useState(
    ApiStripeCheckoutModeEnum.Subscription
  );
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
    const getSubscriptionGroup = (
      type: ApiSubscriptionPlanType
    ): ApiSubscriptionPlanTypeGroupEnum => {
      switch (type) {
        case ApiSubscriptionPlanType.BUSINESS_PLUS_V2: {
          return ApiSubscriptionPlanTypeGroupEnum.BUSINESS_PLUS;
        }

        default: {
          return ApiSubscriptionPlanTypeGroupEnum.PAY_PER_USE;
        }
      }
    };

    const resultingSubscriptionPlans = [
      payPerUse1Subscription,
      payPerUse10Subscription,
      businessPlusV2Subscription,
    ].reduce<TSubscriptionPlanGroups>(
      (result, { prices, type, purchaseButtonLabel: planButtonLabel }) => {
        prices.forEach(({ id, purchaseButtonLabel: priceButtonLabel }) => {
          const priceId = id[stripeEnv];

          if (!priceId) {
            return;
          }

          result[getSubscriptionGroup(type)].push({
            stripeCheckoutMode:
              stripeSubscriptionsCheckoutMode[type] ||
              ApiStripeCheckoutModeEnum.Subscription,
            stripePriceId: priceId,
            description: getPlanPriceDescription(priceId),
            purchaseButtonLabel: priceButtonLabel || planButtonLabel,
          });
        });

        return result;
      },
      {
        [ApiSubscriptionPlanTypeGroupEnum.PAY_PER_USE]: [],
        [ApiSubscriptionPlanTypeGroupEnum.BUSINESS_PLUS]: [],
      } as TSubscriptionPlanGroups
    );

    setSortedSubscriptionPlans(resultingSubscriptionPlans);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!paymentStripePriceId) {
      return;
    }

    const getStripeCheckoutUrl = async () => {
      const innerStripeCheckoutUrl = (
        await post<string, ApiCreateCheckout>(
          "/api/billing/create-checkout-url",
          {
            priceId: paymentStripePriceId,
            mode: paymentStripeCheckoutMode,
          }
        )
      ).data;

      setStripeCheckoutUrl(innerStripeCheckoutUrl);
    };

    void getStripeCheckoutUrl();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStripePriceId]);

  const SubscriptionPlanCard: FunctionComponent<ISubscriptionPlan> = ({
    stripeCheckoutMode,
    stripePriceId,
    description,
    purchaseButtonLabel,
  }) => {
    return (
      <div className="card shadow-lg w-auto flex flex-col justify-center items-center bg-gray-50">
        <div className="card-body">
          {description}
          <div className="card-actions justify-center">
            <button
              onClick={() => {
                setPaymentStripeCheckoutMode(stripeCheckoutMode);
                setPaymentStripePriceId(stripePriceId);
                setIsShownPaymentModal(true);
              }}
              className="btn bg-primary-gradient w-56 self-center mt-5"
            >
              {purchaseButtonLabel || "Abonnieren"}
            </button>
          </div>
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
        : ` gap-10 sm:gap-40 xl:grid-cols-2`;
  } else {
    cardContainerClassNames += ` gap-20 xl:grid-cols-3`;
  }

  return (
    <div className="mt-20 flex flex-col gap-5">
      {isShownPaymentModal && (
        <PaymentMethodModal
          priceId={paymentStripePriceId}
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
        <div className="p-5 sm:p-20 flex flex-col items-center justify-center">
          <div className="btn-group mt-5">
            {Object.entries(sortedSubscriptionPlans).map(
              ([subscriptionGroupName, subscriptionPlans]) => {
                if (subscriptionPlans.length) {
                  return (
                    <button
                      className={`btn btn-wide flex-1 ${
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
                      style={{ padding: 0 }}
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
                  ({
                    stripeCheckoutMode,
                    stripePriceId,
                    description,
                    purchaseButtonLabel,
                  }) => (
                    <SubscriptionPlanCard
                      key={stripePriceId}
                      stripeCheckoutMode={stripeCheckoutMode}
                      stripePriceId={stripePriceId}
                      description={description}
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
