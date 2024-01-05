import { useContext } from "react";

import { IApiOnOfficeSyncEstatesFilterParams } from "../../../../shared/types/on-office";
import { useHttp } from "../../hooks/http";
import { ConfigContext } from "../../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";

export const useOnOfficeSync = () => {
  const { integrationType } = useContext(ConfigContext);
  const { get } = useHttp();

  if (integrationType !== IntegrationTypesEnum.ON_OFFICE) {
    throw new Error("Diese Integration ist nicht korrekt.");
  }

  const handleOnOfficeSync = async (
    estateStatusParams?: IApiOnOfficeSyncEstatesFilterParams
  ): Promise<string[]> => {
    let url = "/api/on-office/sync-estates";

    if (estateStatusParams) {
      Object.keys(estateStatusParams).forEach((key, i) => {
        const value =
          estateStatusParams[key as keyof IApiOnOfficeSyncEstatesFilterParams];

        if (value) {
          url += `${i === 0 ? "?" : "&"}${key}=${value}`;
        }
      });
    }

    return (await get<string[]>(url)).data;
  };

  return { handleOnOfficeSync };
};
