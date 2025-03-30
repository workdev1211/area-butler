import { FC, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { useHistory, useLocation } from "react-router-dom";

import DefaultLayout from "../layout/defaultLayout";
import { useHttp } from "../hooks/http";
import { toastError, toastSuccess } from "../shared/shared.functions";
import { ApiUser } from "../../../shared/types/types";
import { userProfilePath } from "../shared/shared.constants";

// TODO translation required

const CallbackPage: FC = () => {
  const { t } = useTranslation();
  const { get } = useHttp();
  const history = useHistory();
  const queryParams = new URLSearchParams(useLocation().search);

  const subscriptionId = queryParams.get("subscriptionId");
  const checkoutId = queryParams.get("checkoutId");

  console.log('* callback_page');

  useEffect(() => {
    const refetchMe = async (): Promise<void> => {
      try {
        const user = (await get<ApiUser>("/api/company-user/login")).data;
        if (user.subscription) {
          toastSuccess(t(IntlKeys.subscriptions.toastSubscriptionSuccess));
          history.push("/");
        } else {
          setTimeout(() => refetchMe(), 2000);
        }
      } catch {
        toastError(t(IntlKeys.subscriptions.toastSubscriptionError));
      }
    };

    subscriptionId && refetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get, history, subscriptionId]);

  useEffect(() => {
    checkoutId && history.push(userProfilePath);
  }, [checkoutId, history]);

  return (
    <DefaultLayout title="One moment please..." withHorizontalPadding={true}>
      <div className="p-6 space-y-2 artboard phone">
        <progress className="progress progress-primary" value="20" max="100" />
      </div>
    </DefaultLayout>
  );
};

export default CallbackPage;
