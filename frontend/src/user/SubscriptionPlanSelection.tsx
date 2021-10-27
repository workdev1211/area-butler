import { useHttp } from "hooks/http";
import { FunctionComponent } from "react";
import { standardSubscription } from "../../../shared/constants/subscription-plan";


const SubscriptionPlanSelection: FunctionComponent =
  () => {

    const {post} = useHttp();

    const forwardToCheckoutUrl = async (priceId: string) => {
      const checkoutUrl = (await post<string>('/api/billing/create-checkout-url', {priceId})).data;
      window.location.href = checkoutUrl;
    }

    return (
      <div className="mt-20 flex flex-col gap-5">
        <div>
          <h1 className="font-bold text-xl">
            Bitte wählen Sie zur Vervollständigung Ihres Profils ein Abonnement aus
          </h1>

          <button onClick={() => forwardToCheckoutUrl(standardSubscription!.priceIds!.monthlyId!)} className="btn bg-primary-gradient btn-primary">
              Abo abschließen
            </button>
        </div>
      </div>
    );
  };

export default SubscriptionPlanSelection;