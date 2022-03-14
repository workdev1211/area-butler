import { UserActionTypes, UserContext } from "context/UserContext";
import copy from "copy-to-clipboard";
import { useHttp } from "hooks/http";
import { useContext, useState } from "react";
import { toastError, toastSuccess } from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";

export interface CodeSnippetModalProps {
  codeSnippet: string;
  setShowModal: (show: boolean) => void;
  showModal: boolean;
  editDescription?: boolean;
  snapshot?: ApiSearchResultSnapshotResponse;
}

const CodeSnippetModal: React.FunctionComponent<CodeSnippetModalProps> = ({
  codeSnippet,
  setShowModal,
  showModal,
  editDescription = false,
  snapshot,
}) => {
  const { put } = useHttp();
  const { userDispatch } = useContext(UserContext);

  const [description, setDescription] = useState(snapshot?.description);

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);
    if (success) {
      toastSuccess("Karten Snippet erfolgreich kopiert!");
    }
  };

  const closeModal = async () => {
    setShowModal(false);
    if (
      editDescription &&
      snapshot?.id &&
      snapshot.description !== description
    ) {
      try {
        await put(`/api/location/snapshot/${snapshot.id}/description`, {
          description,
        });
        userDispatch({
          type: UserActionTypes.SET_EMBEDDABLE_MAP_DESCRIPTION,
          payload: { id: snapshot.id, description: description || "" },
        });
      } catch (err) {
        toastError("Fehler beim Ändern der Notiz");
        console.error(err);
      }
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="modal modal-open z-9999">
      <div className="modal-box">
        Ihr Karten-Snippet
        {editDescription && (
          <div className="my-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Notizfeld</span>
              </label>
              <textarea
                className="textarea textarea-primary"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              ></textarea>
            </div>
          </div>
        )}
        <div className="my-5">
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
            onClick={() => closeModal()}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;
