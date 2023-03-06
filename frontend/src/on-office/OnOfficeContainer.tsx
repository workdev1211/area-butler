import { FunctionComponent, useContext, useEffect } from "react";

import { IApiOnOfficeRequestParams } from "../../../shared/types/on-office";
import {
  OnOfficeContext,
  OnOfficeContextActionTypesEnum,
} from "../context/OnOfficeContext";
import { useHttp } from "../hooks/http";

window.addEventListener("resize", () => {
  calculateViewHeight();
});

const calculateViewHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

calculateViewHeight();

const OnOfficeContainer: FunctionComponent = () => {
  const { post } = useHttp();
  const { onOfficeContextDispatch } = useContext(OnOfficeContext);

  const getQueryParameters = (): string => window.location.search.substring(1);

  useEffect(() => {
    const verifySignature = async () => {
      const currentUrl = window.location.href;
      const parsedUrl = currentUrl.match(/^(.*)\?(.*)$/);

      console.log(1, "OnOfficeContainerTest", parsedUrl, getQueryParameters());

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
      console.log(2, "OnOfficeContainerTest", onOfficeRequestParams);
      const baseUrl = process.env.REACT_APP_BASE_URL || "";

      try {
        const response = (
          await post<boolean>(
            `${baseUrl}/api/on-office/verify-signature`,
            onOfficeRequestParams
          )
        ).data;

        console.log(9, "OnOfficeContainerTest", response);

        // if (response) {
        //   onOfficeContextDispatch({
        //     type: OnOfficeContextActionTypesEnum.SET_STATE,
        //     payload: {
        //       userId: onOfficeRequestParams.userId,
        //       parameterCacheId: onOfficeRequestParams.parameterCacheId,
        //     },
        //   });
        // }
      } catch (e: any) {
        console.error("Verification error: ", "OnOfficeContainerTest", e);
      }
    };

    // void verifySignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Loading...123</div>;
};

export default OnOfficeContainer;
