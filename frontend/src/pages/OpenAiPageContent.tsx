import { FunctionComponent, useContext, useState } from "react";

import OpenAiModule from "../components/open-ai/OpenAiModule";
import { SearchContext } from "../context/SearchContext";
import { OpenAiQueryTypeEnum } from "../../../shared/types/open-ai";
import { useIntegrationTools } from "../hooks/integration/integrationtools";
import ConfirmationModal from "../components/ConfirmationModal";
import { TOnOfficeIntActTypes } from "../../../shared/types/on-office";
import { ConfigContext } from "../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../shared/types/integration";
import { integrationNames } from "../../../shared/constants/integration";

// TODO could be the same content with a 'OpenAiModal' component
const OpenAiPageContent: FunctionComponent = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState } = useContext(SearchContext);

  const { sendToIntegration, unlockProduct } = useIntegrationTools();

  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isCopyTextButtonDisabled, setIsCopyTextButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);
  const [queryType, setQueryType] = useState(
    searchContextState.openAiQueryType
  );
  const [queryResponse, setQueryResponse] = useState<string>();
  const [unlockParams, setUnlockParams] = useState<{
    isShownModal: boolean;
    modalMessage?: string;
    actionType?: TOnOfficeIntActTypes;
  }>({ isShownModal: false });

  const isShownOnOfficeButton =
    queryType &&
    [
      OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
      OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
      OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    ].includes(queryType) &&
    queryResponse;

  // TODO PROPSTACK CONTINGENT
  const isQueryAvailable =
    integrationType === IntegrationTypesEnum.PROPSTACK ||
    !!searchContextState.realEstateListing?.openAiRequestQuantity;

  const handleResponseFetched = (responseText?: string): void => {
    setIsFetchResponse(false);
    setQueryResponse(responseText);
    setIsCopyTextButtonDisabled(false);
  };

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

      <div className="text-justify text-base">
        Unser KI-Assistent bietet Inspiration für die Konstruktion von Texten,
        insbesondere bei Schwierigkeiten bei der Struktur und Formulierung. Er
        bezieht Umgebungsdaten unserer Analyse und die Informationen zur
        Immobilie mit ein - dies ist unser USP. Die Abfrage kann bis zu 20
        Sekunden dauern. Mit einem Klick auf "An{" "}
        {integrationNames[integrationType!]} senden" wird der Text automatisch
        in das äquivalente Standardfeld in der Immobilie eingefügt.
      </div>

      <OpenAiModule
        searchResultSnapshotId={searchContextState.snapshotId}
        onModuleStatusChange={(isReady) => {
          setIsGenerateButtonDisabled(!isReady);
        }}
        isFetchResponse={isFetchResponse}
        onResponseFetched={handleResponseFetched}
        onQueryTypeChange={(changedQueryType) => {
          setIsCopyTextButtonDisabled(true);
          setQueryType(changedQueryType);
        }}
        initialQueryType={queryType}
      />

      <div
        className={`flex ${
          isShownOnOfficeButton ? "justify-between" : "justify-end"
        }`}
      >
        {isShownOnOfficeButton && (
          <button
            className="btn bg-primary-gradient max-w-fit self-end"
            onClick={() => {
              setIsCopyTextButtonDisabled(true);

              void sendToIntegration({
                exportType: queryType as
                  | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
                  | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
                  | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
                text: queryResponse,
              });
            }}
            disabled={isCopyTextButtonDisabled}
          >
            An {integrationNames[integrationType!]} senden
          </button>
        )}
        <button
          className={`btn bg-primary-gradient max-w-fit self-end ${
            isFetchResponse ? "loading" : ""
          }`}
          form="open-ai-location-description-form"
          onClick={() => {
            if (!queryType) {
              return;
            }

            if (isQueryAvailable) {
              setIsCopyTextButtonDisabled(true);
              setIsFetchResponse(true);
              return;
            }

            setUnlockParams({
              modalMessage: "KI-Texte freischalten?",
              actionType: queryType,
              isShownModal: true,
            });
          }}
          disabled={isGenerateButtonDisabled || isFetchResponse}
        >
          {isQueryAvailable ? "Generieren" : "Freischalten"}
        </button>
      </div>
    </div>
  );
};

export default OpenAiPageContent;
