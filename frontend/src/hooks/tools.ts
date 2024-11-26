import { useContext } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "../i18n/keys";

import { ConfigContext } from "../context/ConfigContext";
import { IIframeTokens, LanguageTypeEnum } from "../../../shared/types/types";
import { toastError } from "../shared/shared.functions";
import { SearchContext } from "../context/SearchContext";

interface IGetTokenDataParams {
  isAddressShown?: boolean;
  tokens?: Partial<IIframeTokens>;
  language?: LanguageTypeEnum;
}

interface IGetTokenDataResult {
  token: string;
  isAddressShown?: boolean;
}

export const useTools = () => {
  const { systemEnv } = useContext(ConfigContext);
  const {
    searchContextState: { responseConfig, responseTokens },
  } = useContext(SearchContext);

  const { t } = useTranslation();

  const createCodeSnippet = (
    tokenDataParams?: IGetTokenDataParams
  ): string => `<iframe
  style="border: none; width: 100%; height: 600px"
  src="${createDirectLink(tokenDataParams)}"
  title="AreaButler Map Snippet"
></iframe>`;

  // try to keep it consistent with backend/src/shared/functions/shared.ts:createDirectLink
  const createDirectLink = (tokenDataParams?: IGetTokenDataParams): string => {
    const { token, isAddressShown: resIsAddressShown } =
      getTokenData(tokenDataParams);
    const origin = window.location.origin;

    let url = `${
      systemEnv !== "local"
        ? origin
        : `${origin.replace(/^(https?:\/\/\w*)(:.*)?$/, "$1")}:3002`
    }/embed?token=${token}`;

    if (typeof resIsAddressShown === "boolean") {
      url += `&isAddressShown=${resIsAddressShown}`;
    }

    return url;
  };

  const getTokenData = (
    tokenDataParams?: IGetTokenDataParams
  ): IGetTokenDataResult => {
    const resultTokens: Partial<IIframeTokens> | undefined =
      tokenDataParams?.tokens
        ? {
            addressToken: tokenDataParams.tokens.addressToken,
            token: tokenDataParams.tokens.token,
            unaddressToken: tokenDataParams.tokens.unaddressToken,
          }
        : responseTokens;

    // left for compatibility purposes
    if (resultTokens?.token) {
      return { token: resultTokens.token };
    }

    if (!resultTokens?.addressToken || !resultTokens?.unaddressToken) {
      toastError(t(IntlKeys.integration.absentTokensError));
      throw new Error(t(IntlKeys.integration.absentTokensError));
    }

    if (typeof tokenDataParams?.isAddressShown === "boolean") {
      return {
        isAddressShown: tokenDataParams.isAddressShown,
        token: tokenDataParams.isAddressShown
          ? resultTokens.addressToken
          : resultTokens.unaddressToken,
      };
    }

    return {
      isAddressShown: !!responseConfig?.showAddress,
      token: !!responseConfig?.showAddress
        ? resultTokens.addressToken
        : resultTokens.unaddressToken,
    };
  };

  return {
    createCodeSnippet,
    createDirectLink,
    getTokenData,
  };
};
