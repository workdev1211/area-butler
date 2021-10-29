import { useHttp } from "hooks/http";
import React, {useContext, useEffect, useState} from "react";
import {
    businessPlusSubscription,
    proSubscription,
    standardSubscription, TRIAL_DAYS
} from "../../../shared/constants/subscription-plan";
import { ApiUserSubscription } from "../../../shared/types/subscription-plan";
import {ConfigContext} from "../context/ConfigContext";

enum PlanInterval {
    INTERVALL_MONTHLY,
    INTERVALL_ANNUALLY
}

interface PlanProps {
    stripePriceId: string;
    name: string;
    price: string;
    intervall: PlanInterval;
    properties: string[];
}

const SubscriptionPlanSelection: React.FunctionComponent =
  () => {

    const {get, post} = useHttp();
    const {stripeEnv} = useContext(ConfigContext);

    const [hadPreviousSubscriptions, setHadPreviousSubscriptions] = useState(false);

    const [intervall, setIntervall] = useState(PlanInterval.INTERVALL_MONTHLY);


    useEffect(() => {
        const fetchSubscriptions = async () => {
            const subscriptions = (await get<ApiUserSubscription[]>('/api/users/me/subscriptions')).data
            setHadPreviousSubscriptions(subscriptions.length > 0);
        }
        fetchSubscriptions();
    }, [hadPreviousSubscriptions]);


    const forwardToCheckoutUrl = async (priceId: string) => {
      const checkoutUrl = (await post<string>('/api/billing/create-checkout-url', {priceId, trialPeriod: 14})).data;
      window.location.href = checkoutUrl;
    }

    const SubscribePlanCard: React.FunctionComponent<PlanProps> = ({stripePriceId, name, price, intervall, properties}) => {
        return (
            <div className="card shadow-lg w-auto flex flex-col justify-center items-center bg-gray-50">
                <div className="card-title w-full">
                    <h2 className="p-0 m-0 text-center w-full">{ name }</h2>
                </div>
                <div className="card-body py-10">
                    <div className="flex justify-center items-baseline">
                        <span className="text-4xl font-semibold w-auto">{price} €</span>
                        <span className="text-lg ml-2"> /{intervall === PlanInterval.INTERVALL_MONTHLY ? 'Monat ' : 'Jahr '}zzgl. MwSt.</span>
                    </div>
                    {!hadPreviousSubscriptions && <div className="flex justify-end">
                        <div className="badge badge-primary">{TRIAL_DAYS} Tage kostenfrei testen!</div>
                    </div>}
                    <div className="flex flex-col my-10">
                        <span className="font-semibold">Eigenschaften:</span>
                        <ul className="list-disc ml-5 mt-2">
                            {properties.map(p => <li>{p}</li>)}
                        </ul>
                    </div>
                    <button onClick={() => forwardToCheckoutUrl(stripePriceId)} className="btn bg-primary-gradient w-56 self-center">
                        Abonnieren
                    </button>
                </div>

            </div>
        )
    }

    return (
      <div className="mt-20 flex flex-col gap-5">
        <div>
          <h1 className="font-bold text-xl">
            Aktuell besitzen Sie kein aktives Abonnement, bitte wählen Sie das passende Abonnement für Sie aus.
          </h1>

            <div className="p-20 flex flex-col items-center justify-center">
                <h2>Abrechnungsintervall</h2>
                <div className="btn-group mt-5">
                    <button className={`btn btn-lg ${intervall === PlanInterval.INTERVALL_MONTHLY ? 'btn-active' : ''}`} onClick={() => setIntervall(PlanInterval.INTERVALL_MONTHLY)}>Monatlich</button>
                    <button className={`btn btn-lg ${intervall === PlanInterval.INTERVALL_ANNUALLY ? 'btn-active' : ''}`} onClick={() => setIntervall(PlanInterval.INTERVALL_ANNUALLY)}>Jährlich</button>
                </div>
                {intervall === PlanInterval.INTERVALL_MONTHLY && <div className="flex flex-wrap gap-20 mt-20">
                    <SubscribePlanCard stripePriceId={standardSubscription.priceIds[stripeEnv].monthlyId!} name="Standard" price="60,00" intervall={PlanInterval.INTERVALL_MONTHLY} properties={standardSubscription.properties} />
                    <SubscribePlanCard stripePriceId={proSubscription.priceIds[stripeEnv].monthlyId!} name="Pro" price="90,00" intervall={PlanInterval.INTERVALL_MONTHLY} properties={proSubscription.properties} />
                    <SubscribePlanCard stripePriceId={businessPlusSubscription.priceIds[stripeEnv].monthlyId!} name="Business" price="250,00" intervall={PlanInterval.INTERVALL_MONTHLY} properties={businessPlusSubscription.properties} />
                </div>}
                {intervall === PlanInterval.INTERVALL_ANNUALLY && <div className="flex flex-wrap gap-20 mt-20">
                    <SubscribePlanCard stripePriceId={standardSubscription.priceIds[stripeEnv].annuallyId!} name="Standard" price="600,00" intervall={PlanInterval.INTERVALL_ANNUALLY} properties={standardSubscription.properties} />
                    <SubscribePlanCard stripePriceId={proSubscription.priceIds[stripeEnv].annuallyId!} name="Pro" price="900,00" intervall={PlanInterval.INTERVALL_ANNUALLY} properties={proSubscription.properties} />
                    <SubscribePlanCard stripePriceId={businessPlusSubscription.priceIds[stripeEnv].annuallyId!} name="Business" price="2500,00" intervall={PlanInterval.INTERVALL_ANNUALLY} properties={businessPlusSubscription.properties} />
                </div>}
            </div>
        </div>
      </div>
    );
  };

export default SubscriptionPlanSelection;
