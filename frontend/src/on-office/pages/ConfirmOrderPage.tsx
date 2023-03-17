import { FunctionComponent, useContext, useEffect, useState } from "react";
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
import { LoadingMessage } from "../../OnOffice";
import { OnOfficeContext } from "../../context/OnOfficeContext";

const ConfirmOrderPage: FunctionComponent = () => {
  const { post } = useHttp();
  const history = useHistory();
  const { onOfficeContextState } = useContext(OnOfficeContext);

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
        extendedClaim:
          onOfficeContextState.extendedClaim! ||
          localStorage.getItem("extendedClaim")!,
        product: JSON.parse(localStorage.getItem("products")!)[0],
        onOfficeQueryParams: queryParamsAndUrl.queryParams,
      };

      localStorage.removeItem("extendedClaim");
      localStorage.removeItem("products");

      console.log(1, "ConfirmOrderPage", confirmOrderData);

      try {
        const { message, availableProductContingents } = (
          await post<IApiOnOfficeConfirmOrderRes, IApiOnOfficeConfirmOrderReq>(
            "/api/on-office/confirm-order",
            confirmOrderData
          )
        ).data;

        if (message) {
          toastError("Ein Fehler ist aufgetreten!");
          console.error("Order confirmation error: ", message);
          setIsErrorOccurred(true);
        }

        // TODO update user products in context
        console.log(
          9,
          "ConfirmOrderPage",
          message,
          availableProductContingents
        );
        // history.push("/map");
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
