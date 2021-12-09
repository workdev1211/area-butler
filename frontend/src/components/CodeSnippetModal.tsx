import copy from "copy-to-clipboard";
import { toastSuccess } from "shared/shared.functions";

export interface CodeSnippetModalProps {
  codeSnippet: string;
  setShowModal: (show: boolean) => void;
  showModal: boolean;
}

const CodeSnippetModal: React.FunctionComponent<CodeSnippetModalProps> = ({
  codeSnippet,
  setShowModal,
  showModal,
}) => {
  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);
    if (success) {
      toastSuccess("Karten Snippet erfolgreich kopiert!");
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="modal modal-open z-9999">
      <div className="modal-box">
        Ihr Karten-Snippet
        <div className="my-2">
          <code className="break-all text-sm">{codeSnippet}</code>
        </div>
        <div className="modal-action">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => copyCodeToClipBoard(codeSnippet)}
          >
            Kopieren
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowModal(false)}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;
