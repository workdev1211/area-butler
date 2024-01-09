import { useContext } from "react";

import {
  IApiOnOfficeEstateAvailStatuses,
  IApiOnOfficeSyncEstatesFilterParams,
} from "../../../../shared/types/on-office";
import { useHttp } from "../../hooks/http";
import { ConfigContext } from "../../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";

const filterQueryParams = (queryParams: URLSearchParams): void => {
  const paramsToDel: string[] = [];

  queryParams.forEach((value, key) => {
    if (["undefined", "null", ""].includes(value)) {
      paramsToDel.push(key);
    }
  });

  paramsToDel.forEach((key) => {
    queryParams.delete(key);
  });
};

export const useOnOfficeSync = () => {
  const { integrationType } = useContext(ConfigContext);
  const { get, put } = useHttp();

  if (integrationType !== IntegrationTypesEnum.ON_OFFICE) {
    throw new Error("Diese Integration ist nicht korrekt.");
  }

  const handleOnOfficeSync = async (
    estateStatusParams?: IApiOnOfficeSyncEstatesFilterParams
  ): Promise<string[]> => {
    return (
      await put<string[]>("/api/on-office/sync-estates", estateStatusParams)
    ).data;
  };

  const fetchAvailStatuses =
    async (): Promise<IApiOnOfficeEstateAvailStatuses> => {
      return (
        await get<IApiOnOfficeEstateAvailStatuses>(
          "/api/on-office/avail-statuses"
        )
      ).data;
    };

  return { handleOnOfficeSync, fetchAvailStatuses };
};
