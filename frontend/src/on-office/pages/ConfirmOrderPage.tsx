import { FunctionComponent, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useHttp } from "../../hooks/http";
import {
  IApiOnOfficeConfirmOrderQueryParams,
  IApiOnOfficeConfirmOrderReq,
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
        onOfficeQueryParams: queryParamsAndUrl.queryParams,
      };

      console.log(1, "ConfirmOrderPage", confirmOrderData);

      try {
        // TODO add a type
        const response = (
          await post<any>("/api/on-office/confirm-order", confirmOrderData)
        ).data;

        // TODO update user products in context
        console.log(9, "ConfirmOrderPage", response);
        // history.push("/map");
      } catch (e: any) {
        toastError("Ein Fehler ist aufgetreten!");
        console.error("Order confirmation error: ", e);
      }
    };

    void confirmOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingMessage />;
};

export default ConfirmOrderPage;
