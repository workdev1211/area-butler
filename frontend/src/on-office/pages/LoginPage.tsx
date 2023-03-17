import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useHttp } from "../../hooks/http";
import {
  OnOfficeContext,
  OnOfficeContextActionTypesEnum,
} from "../../context/OnOfficeContext";
import {
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeLoginReq,
  IApiOnOfficeLoginRes,
} from "../../../../shared/types/on-office";
import { LoadingMessage } from "../../OnOffice";
import {
  getQueryParamsAndUrl,
  toastError,
} from "../../shared/shared.functions";
import { ApiIntUserOnOfficeProdContTypesEnum } from "../../../../shared/types/integration-user";

const LoginPage: FunctionComponent = () => {
  const history = useHistory();
  const { post } = useHttp();
  const { onOfficeContextDispatch } = useContext(OnOfficeContext);
  const [isSignatureNotCorrect, setIsSignatureNotCorrect] = useState(false);

  useEffect(() => {
    const login = async () => {
      const queryParamsAndUrl =
        getQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>();

      if (!queryParamsAndUrl) {
        return;
      }

      const loginData: IApiOnOfficeLoginReq = {
        url: queryParamsAndUrl.url,
        onOfficeQueryParams: queryParamsAndUrl.queryParams,
      };

      console.log(1, "LoginPage", loginData);

      try {
        const {
          integrationUserId,
          extendedClaim,
          estateId,
          availableProductContingents,
        } = (
          await post<IApiOnOfficeLoginRes>("/api/on-office/login", loginData)
        ).data;

        console.log(
          9,
          "LoginPage",
          integrationUserId,
          extendedClaim,
          estateId,
          availableProductContingents
        );

        onOfficeContextDispatch({
          type: OnOfficeContextActionTypesEnum.SET_STATE,
          payload: {
            integrationUserId,
            extendedClaim,
            estateId,
            availableProductContingents,
          },
        });

        const hasProductContingent =
          availableProductContingents &&
          Object.keys(availableProductContingents).some(
            (contingentName) =>
              availableProductContingents[
                contingentName as ApiIntUserOnOfficeProdContTypesEnum
              ]
          );

        if (hasProductContingent) {
          history.push("/open-ai");
          return;
        }

        history.push("/products");
      } catch (e: any) {
        setIsSignatureNotCorrect(true);
        toastError("Ein Fehler ist aufgetreten!");
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
