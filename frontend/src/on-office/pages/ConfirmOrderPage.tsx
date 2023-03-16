import { FunctionComponent, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useHttp } from "../../hooks/http";
import { IApiOnOfficeConfirmOrderReq } from "../../../../shared/types/on-office";
import { toastError } from "../../shared/shared.functions";
import { LoadingMessage } from "../../OnOffice";
import { OnOfficeContext } from "../../context/OnOfficeContext";

const ConfirmOrderPage: FunctionComponent = () => {
  const { post } = useHttp();
  const history = useHistory();
  const { onOfficeContextState } = useContext(OnOfficeContext);

  useEffect(() => {
    const confirmOrder = async () => {
      const currentUrl = window.location.href;
      const parsedUrl = currentUrl.match(/^(.*)\?(.*)$/);

      console.log(1, "ConfirmOrderPage", parsedUrl);

      if (parsedUrl?.length !== 3) {
        return;
      }

      const confirmOrderData = parsedUrl[2]
        .split("&")
        .reduce((result, currentParam) => {
          const keyValue = currentParam.split("=");
          // @ts-ignore
          result[keyValue[0]] = keyValue[1];

          return result;
        }, {} as IApiOnOfficeConfirmOrderReq);

      confirmOrderData.url = parsedUrl[1];
      confirmOrderData.extendedClaim = onOfficeContextState.extendedClaim! || localStorage.getItem('extendedClaim')!;
      console.log(2, "ConfirmOrderPage", confirmOrderData);

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
