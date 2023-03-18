import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useHttp } from "../../hooks/http";
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
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  IApiIntUserAvailProdContingents,
} from "../../../../shared/types/integration-user";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { ApiCoordinates, ApiUser } from "../../../../shared/types/types";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";

const LoginPage: FunctionComponent = () => {
  const history = useHistory();
  const { post } = useHttp();
  const { searchContextDispatch } = useContext(SearchContext);
  const { userDispatch } = useContext(UserContext);
  const [isSignatureNotCorrect, setIsSignatureNotCorrect] = useState(false);

  useEffect(() => {
    const login = async () => {
      // const queryParamsAndUrl =
      //   getQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>();
      //
      // if (!queryParamsAndUrl) {
      //   return;
      // }
      //
      // const loginData: IApiOnOfficeLoginReq = {
      //   url: queryParamsAndUrl.url,
      //   onOfficeQueryParams: queryParamsAndUrl.queryParams,
      // };
      //
      // console.log(1, "LoginPage", loginData);

      try {
        // const {
        //   address,
        //   estateId,
        //   integrationUserId,
        //   extendedClaim,
        //   availableProductContingents,
        // } = (
        //   await post<IApiOnOfficeLoginRes>("/api/on-office/login", loginData)
        // ).data;
        //
        // console.log(
        //   9,
        //   "LoginPage",
        //   address,
        //   estateId,
        //   integrationUserId,
        //   extendedClaim,
        //   availableProductContingents
        // );
        //
        // onOfficeContextDispatch({
        //   type: OnOfficeContextActionTypesEnum.SET_STATE,
        //   payload: {
        //     estateId,
        //     integrationUserId,
        //     extendedClaim,
        //     availableProductContingents,
        //   },
        // });
        //
        // const hasProductContingent =
        //   availableProductContingents &&
        //   Object.keys(availableProductContingents).some(
        //     (contingentName) =>
        //       availableProductContingents[
        //         contingentName as ApiIntUserOnOfficeProdContTypesEnum
        //       ] > 0
        //   );

        // TODO TEST DATA
        const integrationUserId = "21";
        const accessToken = "asdas";
        const hasProductContingent = true;
        const address = "Herzbergstraße 2A, 14469 Potsdam, Deutschland";
        const coordinates: ApiCoordinates = {
          lat: 52.4164949,
          lng: 12.9964363,
        };

        if (!hasProductContingent) {
          history.push("/products");
          return;
        }

        // TODO DUMMY DATA
        const user = {
          showTour: {
            search: false,
            result: false,
            realEstates: false,
            customers: false,
            profile: false,
            editor: false,
          },
          requestContingents: [],
        } as unknown as ApiUser;

        userDispatch({
          type: UserActionTypes.SET_USER,
          payload: user,
        });

        userDispatch({
          type: UserActionTypes.SET_INTEGRATION_USER,
          payload: {
            integrationUserId,
            accessToken,
            integrationType: IntegrationTypesEnum.ON_OFFICE,
            availProdContingents: {
              [ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI]: 5,
            },
          },
        });

        searchContextDispatch({
          type: SearchContextActionTypes.SET_PLACES_LOCATION,
          payload: { label: address },
        });

        searchContextDispatch({
          type: SearchContextActionTypes.SET_LOCATION,
          payload: { ...coordinates },
        });

        // TODO TEST DATA
        history.push("/search");
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
