import { FunctionComponent, useState } from "react";

import OpenAiModule from "./open-ai/OpenAiModule";

interface IOpenAiModalProps {
  closeModal: () => void;
  searchResultSnapshotId: string;
}

const OpenAiModal: FunctionComponent<IOpenAiModalProps> = ({
  closeModal,
  searchResultSnapshotId,
}) => {
  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);

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
          searchResultSnapshotId={searchResultSnapshotId}
          onModuleStatusChange={(isReady) => {
            setIsGenerateButtonDisabled(!isReady);
          }}
          isFetchResponse={isFetchResponse}
          onResponseFetched={() => {
            setIsFetchResponse(false);
          }}
        />
        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={closeModal}>
            Schließen
          </button>
          <button
            className={`btn bg-primary-gradient max-w-fit self-end ${
              isFetchResponse ? "loading" : ""
            }`}
            form={"open-ai-location-description-form"}
            onClick={() => {
              setIsFetchResponse(true);
            }}
            disabled={isGenerateButtonDisabled || isFetchResponse}
          >
            Generieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenAiModal;
