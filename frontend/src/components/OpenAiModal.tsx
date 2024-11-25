import { FC, useContext } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { OpenAiQueryTypeEnum } from "../../../shared/types/open-ai";
import crossIcon from "../assets/icons/cross.svg";
import {
  IntegrationActionTypeEnum,
  TUnlockIntProduct,
} from "../../../shared/types/integration";
import { ConfigContext } from "../context/ConfigContext";
import "./OpenAiModal.scss";
import OpenAiChat from "./open-ai/OpenAiChat";
import { useIntegrationTools } from "../hooks/integration/integrationtools";
import { FeatureTypeEnum } from "../../../shared/types/types";
import { useUserState } from "../hooks/userstate";

interface IOpenAiModalProps {
  closeModal: () => void;
  searchResultSnapshotId: string;
  queryType: OpenAiQueryTypeEnum;
  performUnlock?: TUnlockIntProduct;
}

const OpenAiModal: FC<IOpenAiModalProps> = ({
  closeModal,
  searchResultSnapshotId,
  queryType,
  performUnlock,
}) => {
  const { t } = useTranslation();
  const { integrationType } = useContext(ConfigContext);
  const { sendToIntegration } = useIntegrationTools();
  const { checkIsFeatAvailable } = useUserState();

  const isIntegration = !!integrationType;
  const isSendToIntAllowed = (queryType: OpenAiQueryTypeEnum) => {
    return (
      isIntegration &&
      [
        OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
      ].includes(queryType)
    );
  };

  const isOpenAiAvailable = checkIsFeatAvailable(FeatureTypeEnum.OPEN_AI);

  const handleUnlock = (): void => {
    if (performUnlock) {
      performUnlock(
        t(IntlKeys.snapshotEditor.dataTab.unlockAiTexts),
        IntegrationActionTypeEnum.UNLOCK_OPEN_AI
      );
    }
  };

  return (
    <div className="modal modal-open z-9000">
      <div className="modal-box modal-full-screen">
        <h1 className="text-xl flex items-center gap-2 p-3 border-b">
          {t(IntlKeys.snapshotEditor.dataTab.aiTextsFromMagicPen)}
          <button
            className="btn btn-sm absolute right-3 top-3"
            onClick={closeModal}
          >
            <img
              src={crossIcon}
              alt="modal-close"
              title="KI Assistenten schließen"
            />
          </button>
        </h1>
        <div className="scrollable-content pt-4 overflow-y-scroll">
          <OpenAiChat
            searchResultSnapshotId={searchResultSnapshotId}
            queryType={queryType}
            handleUnlock={handleUnlock}
            sendToIntegration={sendToIntegration}
            isOpenAiAvailable={isOpenAiAvailable}
            isSendToIntAllowed={isSendToIntAllowed}
            integrationType={integrationType}
          />
        </div>
      </div>
    </div>
  );
};

export default OpenAiModal;
