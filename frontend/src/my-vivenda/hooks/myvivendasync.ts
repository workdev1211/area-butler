import { AxiosResponse } from "axios";

import { useHttp } from "../../hooks/http";
import { TSendToIntegrationData } from "../../../../shared/types/integration";
import { toastError } from "../../shared/shared.functions";
import {
  AreaButlerExportTypesEnum,
  IApiUploadFileReq,
} from "../../../../shared/types/types";

export const useMyVivendaSync = () => {
  const { post } = useHttp();

  const uploadMapScreenshot = (
    uploadMapScreenData: IApiUploadFileReq
  ): Promise<AxiosResponse<void>> =>
    post<void, IApiUploadFileReq>(
      "/api/my-vivenda/map-screenshot",
      uploadMapScreenData
    );

  const sendToMyVivenda = async (
    sendToMyVivendaData: TSendToIntegrationData
  ): Promise<AxiosResponse<void>> => {
    switch (sendToMyVivendaData.exportType) {
      case AreaButlerExportTypesEnum.SCREENSHOT: {
        return uploadMapScreenshot(sendToMyVivendaData as IApiUploadFileReq);
      }
    }

    const errorMessage = "Falscher Exporttyp wurde angegeben!";
    toastError(errorMessage);
    console.error(errorMessage);
    throw new Error(errorMessage);
  };

  return { sendToMyVivenda };
};
