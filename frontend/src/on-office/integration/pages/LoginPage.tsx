import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { IApiOnOfficeRequestParams } from "../../../../../shared/types/on-office";
import {
  OnOfficeContext,
  OnOfficeContextActionTypesEnum,
} from "../../../context/OnOfficeContext";
import { useHttp } from "../../../hooks/http";

window.addEventListener("resize", () => {
  calculateViewHeight();
});

const calculateViewHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

calculateViewHeight();

const LoginPage: FunctionComponent = () => {
  const history = useHistory();
  const { post } = useHttp();
  const { onOfficeContextDispatch } = useContext(OnOfficeContext);
  const [isSignatureNotCorrect, setIsSignatureNotCorrect] = useState(false);

  useEffect(() => {
    const login = async () => {
      const currentUrl = window.location.href;
      const parsedUrl = currentUrl.match(/^(.*)\?(.*)$/);

      console.log(1, "LoginPage", parsedUrl);

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
        }, {} as IApiOnOfficeRequestParams);

      onOfficeRequestParams.url = parsedUrl[1];
      console.log(2, "LoginPage", onOfficeRequestParams);

      try {
        // TODO a add type
        const response = (
          await post<{ integrationUserId: string }>(
            "/api/on-office/login",
            onOfficeRequestParams
          )
        ).data;

        console.log(9, "LoginPage", response);

        onOfficeContextDispatch({
          type: OnOfficeContextActionTypesEnum.SET_STATE,
          payload: {
            integrationUserId: response.integrationUserId,
            parameterCacheId: onOfficeRequestParams.parameterCacheId,
          },
        });

        // TODO add a check if no products
        history.push("/products");
        // TODO if user have products
        // history.push('/map');
      } catch (e: any) {
        setIsSignatureNotCorrect(true);
        console.error("Verification error: ", "OnOfficeContainer", e);
      }
    };

    void login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center h-[100vh] text-lg">
      {isSignatureNotCorrect ? "Signatur nicht korrekt!" : "Loading..."}
    </div>
  );
};

export default LoginPage;
