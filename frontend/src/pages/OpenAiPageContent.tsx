import { FunctionComponent, useContext, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import { OpenAiQueryTypeEnum } from "../../../shared/types/open-ai";
import { useIntegrationTools } from "../hooks/integration/integrationtools";
import ConfirmationModal from "../components/ConfirmationModal";
import { ConfigContext } from "../context/ConfigContext";
import { IntegrationActionTypeEnum } from "../../../shared/types/integration";
import OpenAiChat from "../components/open-ai/OpenAiChat";

// TODO could be the same content with a 'OpenAiModal' component
const OpenAiPageContent: FunctionComponent = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState } = useContext(SearchContext);

  const { sendToIntegration, unlockProduct } = useIntegrationTools();

  const [queryType] = useState(searchContextState.openAiQueryType);
  const [unlockParams, setUnlockParams] = useState<{
    isShownModal: boolean;
    modalMessage?: string;
    actionType?: IntegrationActionTypeEnum;
  }>({ isShownModal: false });

  const isShownOnOfficeButton = (queryType: OpenAiQueryTypeEnum) =>
    queryType &&
    [
      OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
      OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
      OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    ].includes(queryType);

  const isQueryAvailable =
    !!searchContextState.realEstateListing?.openAiRequestQuantity;

  const handleUnlock = (): void => {
    setUnlockParams({
      modalMessage: "KI-Texte freischalten?",
      actionType: IntegrationActionTypeEnum.UNLOCK_OPEN_AI,
      isShownModal: true,
    });
  };

  console.log(searchContextState);

  return (
    <div className="flex flex-col gap-5 m-5">
      {unlockParams.isShownModal && (
        <ConfirmationModal
          closeModal={() => {
            setUnlockParams({ isShownModal: false });
          }}
          onConfirm={async () => {
            await unlockProduct(unlockParams.actionType!);
          }}
          text={unlockParams.modalMessage!}
        />
      )}

      <h1 className="text-xl gap-2">KI Texte aus der magischen Feder</h1>

      <OpenAiChat
        searchResultSnapshotId={searchContextState.snapshotId!!}
        queryType={queryType!!}
        fixedQueryType={false}
        handleUnlock={handleUnlock}
        sendToIntegration={sendToIntegration}
        isNotIntOrAvailForIntUser={isQueryAvailable}
        isSendToIntAllowed={isShownOnOfficeButton}
        integrationType={integrationType}
      />
    </div>
  );
};

export default OpenAiPageContent;
