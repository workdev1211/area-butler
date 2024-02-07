import { useHttp } from "../../hooks/http";
import {
  IApiIntUpdEstTextFieldReq,
  IApiRealEstAvailIntStatuses,
  IApiSyncEstatesIntFilterParams,
} from "../../../../shared/types/integration";

export const usePropstackSync = () => {
  const { get, patch, put } = useHttp();

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

  const sendToPropstack = async (
    sendToPropstackData: IApiIntUpdEstTextFieldReq,
    realEstateIntId: string
  ): Promise<void> => {
    await patch<void, IApiIntUpdEstTextFieldReq>(
      `/api/propstack/property-text/${realEstateIntId}`,
      sendToPropstackData
    );
  };

  return { fetchAvailPropstackStatuses, handlePropstackSync, sendToPropstack };
};
