import { useHttp } from "../../hooks/http";
import {
  IApiRealEstAvailIntStatuses,
  IApiSyncEstatesIntFilterParams,
} from "../../../../shared/types/integration";

export const usePropstackSync = () => {
  const { get, put } = useHttp();

  const fetchAvailPropstackStatuses =
    async (): Promise<IApiRealEstAvailIntStatuses> => {
      return (
        await get<IApiRealEstAvailIntStatuses>("/api/propstack/avail-statuses")
      ).data;
    };

  const handlePropstackSync = async (
    estateStatusParams?: IApiSyncEstatesIntFilterParams
  ): Promise<string[]> => {
    return (
      await put<string[]>("/api/propstack/sync-estates", estateStatusParams)
    ).data;
  };

  return { fetchAvailPropstackStatuses, handlePropstackSync };
};
