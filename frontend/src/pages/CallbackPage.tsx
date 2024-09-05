import { FC, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import DefaultLayout from "../layout/defaultLayout";
import { useHttp } from "../hooks/http";
import { toastError, toastSuccess } from "../shared/shared.functions";
import { ApiUser } from "../../../shared/types/types";

// TODO translation required

const CallbackPage: FC = () => {
  const { get } = useHttp();
  const history = useHistory();
  const queryParams = new URLSearchParams(useLocation().search);

  const subscriptionId = queryParams.get("subscriptionId");
  const checkoutId = queryParams.get("checkoutId");

  useEffect(() => {
    const refetchMe = async (): Promise<void> => {
      try {
        const user = (await get<ApiUser>("/api/users/login")).data;
        if (user.subscription) {
          toastSuccess("Abonnement erfolgreich abgeschlossen");
          history.push("/");
        } else {
          setTimeout(() => refetchMe(), 2000);
        }
      } catch {
        toastError("Fehler beim Anlegen des Abonnements");
      }
    };

    subscriptionId && refetchMe();
  }, [get, history, subscriptionId]);

  useEffect(() => {
    checkoutId && history.push("/profile");
  }, [checkoutId, history]);

  return (
    <DefaultLayout title="Einen Moment bitte..." withHorizontalPadding={true}>
      <div className="p-6 space-y-2 artboard phone">
        <progress className="progress progress-primary" value="20" max="100" />
      </div>
    </DefaultLayout>
  );
};

export default CallbackPage;
