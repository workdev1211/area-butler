import {UserContext} from "context/UserContext";
import {useHttp} from "hooks/http";
import {useContext} from "react";
import {toastError} from "shared/shared.functions";
import {ApiUser} from "../../../shared/types/types";
import IncreaseRequestLimitForm from "./IncreaseRequestLimitForm";
import {ConfigContext} from "../context/ConfigContext";

export interface IncreaseRequestLimitFormHandlerProps {
    formId?: string;
    beforeSubmit?: () => void;
    postSubmit?: (success: boolean) => void;
}

const IncreaseRequestLimitFormHandler: React.FunctionComponent<IncreaseRequestLimitFormHandlerProps> =
    ({
         formId, beforeSubmit = () => {
        }, postSubmit = () => {
        }
     }) => {
        const {post} = useHttp();
        const {userState} = useContext(UserContext);
        const {stripeEnv} = useContext(ConfigContext);

        const onSubmit = async ({amount}: any) => {
            try {
                beforeSubmit();
                const user: ApiUser = userState.user;
                const priceId = user.subscriptionPlan?.priceIds[stripeEnv].requestIncreaseId!;
                window.location.href = (await post<string>('/api/billing/create-checkout-url', {
                    priceId,
                    amount,
                    mode: 'payment'
                })).data;
                postSubmit(true);
            } catch (err) {
                console.log(err);
                toastError("Fehler bei der Erhöhung des Limits");
                postSubmit(false);
            }
        };

        return <IncreaseRequestLimitForm formId={formId!} onSubmit={onSubmit}/>;
    };

export default IncreaseRequestLimitFormHandler;
