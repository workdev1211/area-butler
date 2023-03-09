import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useHttp } from "../../../hooks/http";
import {
  OnOfficeContext,
  OnOfficeContextActionTypesEnum,
} from "../../../context/OnOfficeContext";
import { IApiOnOfficeRequestParams } from "../../../../../shared/types/on-office";
import { LoadingMessage } from "../../../OnOfficeShop";

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
        // TODO add a type
        const response = (
          await post<{ integrationUserId: string }>(
            "/api/on-office/login",
            onOfficeRequestParams
          )
        ).data;


        onOfficeContextDispatch({
          type: OnOfficeContextActionTypesEnum.SET_STATE,
          payload: {
            integrationUserId: response.integrationUserId,
            parameterCacheId: onOfficeRequestParams.parameterCacheId,
          },
        });

        history.push("/open-ai");
      } catch (e: any) {
        setIsSignatureNotCorrect(true);
        console.error("Verification error: ", e);
      }
    };

    void login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center h-[100vh] text-lg">
      {isSignatureNotCorrect ? "Signatur nicht korrekt!" : <LoadingMessage />}
    </div>
  );
};

export default LoginPage;
