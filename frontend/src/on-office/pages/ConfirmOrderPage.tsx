import { FunctionComponent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useHttp } from "../../hooks/http";
import {
  IApiOnOfficeConfirmOrderQueryParams,
  IApiOnOfficeConfirmOrderReq,
  IApiOnOfficeConfirmOrderRes,
} from "../../../../shared/types/on-office";
import {
  getQueryParamsAndUrl,
  toastError,
} from "../../shared/shared.functions";
import { LoadingMessage } from "../OnOfficeContainer";

const ConfirmOrderPage: FunctionComponent = () => {
  const { post } = useHttp();
  const history = useHistory();

  const [isErrorOccurred, setIsErrorOccurred] = useState(false);

  useEffect(() => {
    const confirmOrder = async () => {
      const queryParamsAndUrl =
        getQueryParamsAndUrl<IApiOnOfficeConfirmOrderQueryParams>();

      if (!queryParamsAndUrl) {
        return;
      }

      const confirmOrderData: IApiOnOfficeConfirmOrderReq = {
        url: queryParamsAndUrl.url,
        // TODO change to the integration user access token
        product: JSON.parse(localStorage.getItem("products")!)[0],
        onOfficeQueryParams: queryParamsAndUrl.queryParams,
      };

      console.log("ConfirmOrderPage", 1, confirmOrderData);

      try {
        const { message, availableProductContingents } = (
          await post<IApiOnOfficeConfirmOrderRes, IApiOnOfficeConfirmOrderReq>(
            "/api/on-office/confirm-order",
            confirmOrderData,
            {
              // TODO get access token from query params sent from create order page
              Authorization: `AccessToken ${localStorage.getItem(
                "accessToken"
              )!}`,
            }
          )
        ).data;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("products");

        if (message) {
          toastError("Ein Fehler ist aufgetreten!");
          console.error("Order confirmation error: ", message);
          setIsErrorOccurred(true);
        }

        // TODO update user products in context
        console.log(
          "ConfirmOrderPage",
          9,
          message,
          availableProductContingents
        );
        // history.push("/search");
      } catch (e) {
        toastError("Ein Fehler ist aufgetreten!");
        console.error("Order confirmation error: ", e);
        setIsErrorOccurred(true);
      }
    };

    void confirmOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center h-[100vh] text-lg">
      {isErrorOccurred ? "Ein Fehler ist aufgetreten!" : <LoadingMessage />}
    </div>
  );
};

export default ConfirmOrderPage;
