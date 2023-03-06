import { FunctionComponent, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { IApiOnOfficeConfirmOrder } from "../../../../shared/types/on-office";
import { useHttp } from "../../hooks/http";
import { toastError } from "../../shared/shared.functions";

const ConfirmOrderPage: FunctionComponent = () => {
  const { post } = useHttp();
  const history = useHistory();

  useEffect(() => {
    const confirmOrder = async () => {
      const currentUrl = window.location.href;
      const parsedUrl = currentUrl.match(/^(.*)\?(.*)$/);

      console.log(1, "ConfirmOrderPage", parsedUrl);

      if (parsedUrl?.length !== 3) {
        return;
      }

      const onOfficeRequestParams = parsedUrl[2]
        .split("&")
        .reduce((result, currentParam) => {
          const keyValue = currentParam.split("=");
          // @ts-ignore
          result[keyValue[0]] = keyValue[1];

          return result;
        }, {} as IApiOnOfficeConfirmOrder);

      onOfficeRequestParams.url = parsedUrl[1];
      const baseUrl = process.env.REACT_APP_BASE_URL || "";

      try {
        const response = (
          await post<any>(
            `${baseUrl}/api/on-office/confirm-order`,
            onOfficeRequestParams
          )
        ).data;

        // update user products in context
        console.log(9, "ConfirmOrderPage", response);
        history.push("/map");
      } catch (e: any) {
        toastError("Error!");
        console.error("Order confirmation error: ", e);
      }
    };

    void confirmOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Loading...</div>;
};

export default ConfirmOrderPage;
