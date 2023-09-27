import { FunctionComponent, useContext, useState } from "react";

import OpenAiModule from "../../components/open-ai/OpenAiModule";
import { LoadingMessage } from "../OnOfficeContainer";
import { SearchContext } from "../../context/SearchContext";
import DefaultLayout from "../../layout/defaultLayout";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";
import { useIntegrationTools } from "../../hooks/integrationtools";
import ConfirmationModal from "../../components/ConfirmationModal";
import { TOnOfficeIntActTypes } from "../../../../shared/types/on-office";

const OpenAiPage: FunctionComponent = () => {
  const { searchContextState } = useContext(SearchContext);

  const { sendToOnOffice, unlockProduct } = useIntegrationTools();

  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isCopyTextButtonDisabled, setIsCopyTextButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);
  const [queryType, setQueryType] = useState<OpenAiQueryTypeEnum>();
  const [queryResponse, setQueryResponse] = useState<string | undefined>();
  const [unlockParams, setUnlockParams] = useState<{
    isShownModal: boolean;
    modalMessage?: string;
    actionType?: TOnOfficeIntActTypes;
  }>({ isShownModal: false });

  const isShownOnOfficeButton =
    !!queryType &&
    ![
      OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
      OpenAiQueryTypeEnum.GENERAL_QUESTION,
    ].includes(queryType);

  const isQueryAvailable =
    !!searchContextState.realEstateListing?.openAiRequestQuantity;

  const handleResponseFetched = (responseText?: string): void => {
    setIsFetchResponse(false);
    setQueryResponse(responseText);
    setIsCopyTextButtonDisabled(false);
  };

  if (!searchContextState.snapshotId) {
    return <LoadingMessage />;
  }

  return (
    <DefaultLayout
      title={`Adresse: ${searchContextState.placesLocation?.label}`}
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
    >
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

      <div className="flex flex-col my-5 gap-5">
        <h1 className="text-xl gap-2">KI Texte aus der magischen Feder</h1>

        <div className="text-justify text-base">
          Unser KI-Assistent bietet Inspiration für die Konstruktion von Texten,
          insbesondere bei Schwierigkeiten bei der Struktur und Formulierung. Er
          bezieht Umgebungsdaten unserer Analyse und die Informationen zur
          Immobilie mit ein - dies ist unser USP. Die Abfrage kann bis zu 20
          Sekunden dauern. Mit einem Klick auf "An onOffice senden" wird der
          Text automatisch in das äquivalente Standardfeld in der Immobilie
          eingefügt.
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

                void sendToOnOffice({
                  exportType: queryType!,
                  text: queryResponse!,
                });
              }}
              disabled={isCopyTextButtonDisabled}
            >
              An onOffice senden
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
    </DefaultLayout>
  );
};

export default OpenAiPage;
