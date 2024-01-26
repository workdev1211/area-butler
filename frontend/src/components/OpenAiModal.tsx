import { FunctionComponent, useContext, useState } from "react";

import OpenAiModule from "./open-ai/OpenAiModule";
import { OpenAiQueryTypeEnum } from "../../../shared/types/open-ai";
import { useIntegrationTools } from "../hooks/integrationtools";
import {
  IntegrationTypesEnum,
  TUnlockIntProduct,
} from "../../../shared/types/integration";
import { SearchContext } from "../context/SearchContext";
import { ConfigContext } from "../context/ConfigContext";

interface IOpenAiModalProps {
  closeModal: () => void;
  searchResultSnapshotId: string;
  queryType?: OpenAiQueryTypeEnum;
  performUnlock?: TUnlockIntProduct;
}

const OpenAiModal: FunctionComponent<IOpenAiModalProps> = ({
  closeModal,
  searchResultSnapshotId,
  queryType,
  performUnlock,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const { sendToOnOffice } = useIntegrationTools();

  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);
  const [isCopyTextButtonDisabled, setIsCopyTextButtonDisabled] =
    useState(true);
  const [queryResponse, setQueryResponse] = useState("");

  const isIntegration = !!integrationType;

  // TODO PROPSTACK CONTINGENT
  const isNotIntOrAvailForIntUser =
    !isIntegration ||
    !!realEstateListing?.openAiRequestQuantity ||
    integrationType === IntegrationTypesEnum.PROPSTACK;

  const handleUnlock = (): void => {
    if (performUnlock) {
      performUnlock("KI-Texte freischalten?", queryType);
    }
  };

  return (
    <div className="modal modal-open z-2000">
      <div className="modal-box max-h-screen overflow-y-auto min-w-[75%]">
        <h1 className="text-xl mb-5 flex items-center gap-2">
          <span>KI Texte aus der magischen Feder</span>
          <span className="badge badge-primary">BETA</span>
        </h1>
        <div className="text-justify text-base">
          Unser KI-Textgenerator bietet Inspiration für die Konstruktion von
          Texten, insbesondere bei Schwierigkeiten bei der Struktur und
          Formulierung. Er bezieht Umgebungsdaten und Informationen zur
          Immobilie mit ein. Das Feature befindet sich derzeit in der Beta-Phase
          und es wird empfohlen, die Fakten vor Verwendung zu überprüfen.
        </div>
        <OpenAiModule
          initialQueryType={queryType}
          searchResultSnapshotId={searchResultSnapshotId}
          onModuleStatusChange={(isReady): void => {
            setIsGenerateButtonDisabled(!isReady);
          }}
          isFetchResponse={isFetchResponse}
          onResponseFetched={(responseText): void => {
            setIsCopyTextButtonDisabled(false);
            setQueryResponse(responseText);
            setIsFetchResponse(false);
          }}
        />
        <div
          className={`modal-action ${isIntegration ? "justify-between" : ""}`}
        >
          {isIntegration && (
            <button
              className="btn bg-primary-gradient max-w-fit self-end"
              onClick={(): void => {
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
          <div className="flex gap-2">
            <button type="button" className="btn btn-sm" onClick={closeModal}>
              Schließen
            </button>
            <button
              className={`btn bg-primary-gradient max-w-fit self-end ${
                isFetchResponse ? "loading" : ""
              }`}
              form="open-ai-location-description-form"
              onClick={() => {
                if (isNotIntOrAvailForIntUser) {
                  setIsFetchResponse(true);
                  return;
                }

                handleUnlock();
              }}
              disabled={isGenerateButtonDisabled || isFetchResponse}
            >
              {isNotIntOrAvailForIntUser ? "Generieren" : "Freischalten"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAiModal;
