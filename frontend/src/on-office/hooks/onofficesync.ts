import { useHttp } from "../../hooks/http";
import {
  IApiIntUpdEstTextFieldReq,
  IApiRealEstAvailIntStatuses,
  IApiSyncEstatesIntFilterParams,
} from "../../../../shared/types/integration";
import { IApiOnOfficeUplEstFileOrLinkReq } from "../../../../shared/types/on-office";

export const useOnOfficeSync = () => {
  const { get, post, patch, put } = useHttp();

  const fetchAvailOnOfficeStatuses =
    async (): Promise<IApiRealEstAvailIntStatuses> => {
      return (
        await get<IApiRealEstAvailIntStatuses>("/api/on-office/avail-statuses")
      ).data;
    };

  const handleOnOfficeSync = async (
    estateStatusParams?: IApiSyncEstatesIntFilterParams
  ): Promise<string[]> => {
    return (
      await put<string[]>("/api/on-office/sync-estates", estateStatusParams)
    ).data;
  };

  const sendToOnOffice = async (
    sendToOnOfficeData:
      | IApiIntUpdEstTextFieldReq
      | IApiOnOfficeUplEstFileOrLinkReq,
    realEstateIntId: string
  ): Promise<void> => {
    if ("text" in sendToOnOfficeData) {
      await patch<
        void,
        IApiIntUpdEstTextFieldReq | IApiOnOfficeUplEstFileOrLinkReq
      >(`/api/on-office/estate-text/${realEstateIntId}`, sendToOnOfficeData);

      return;
    }

    if (sendToOnOfficeData.filename) {
      sendToOnOfficeData.filename = sendToOnOfficeData.filename.replace(
        /[/\\?%*:|"<>\s,]/g,
        "-"
      );
    }

    await post<void, IApiOnOfficeUplEstFileOrLinkReq>(
      `/api/on-office/estate-file/${realEstateIntId}`,
      sendToOnOfficeData
    );
  };

  return { fetchAvailOnOfficeStatuses, handleOnOfficeSync, sendToOnOffice };
};
