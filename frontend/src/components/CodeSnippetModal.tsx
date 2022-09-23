import { FunctionComponent, useContext, useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";

import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { toastError, toastSuccess } from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import closeIcon from "../assets/icons/cross.svg";
import copyIcon from "../assets/icons/copy.svg";
import downloadIcon from "../assets/icons/download.svg";
import { svgPrimaryColorFilter } from "../shared/shared.constants";
import { getQrCodeBase64 } from "../export/QrCode";

export interface CodeSnippetModalProps {
  codeSnippet: string;
  directLink: string;
  isShownModal: boolean;
  closeModal: () => void;
  editDescription?: boolean;
  snapshot?: ApiSearchResultSnapshotResponse;
  label?: string;
}

const CodeSnippetModal: FunctionComponent<CodeSnippetModalProps> = ({
  codeSnippet,
  directLink,
  isShownModal = false,
  closeModal,
  editDescription = false,
  snapshot,
  label,
}) => {
  const { put } = useHttp();
  const { userDispatch } = useContext(UserContext);

  const [description, setDescription] = useState(snapshot?.description);

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const handleCloseModal = async () => {
    closeModal();

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

  useEffect(() => {
    const handleEscape = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        await handleCloseModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isShownModal) {
    return null;
  }

  return (
    <div className="modal modal-open z-9999">
      <div className="modal-box flex flex-col">
        <div className="flex justify-between items-center">
          <div>Ihr Karten-Snippet</div>
          <img
            className="cursor-pointer w-5 h-5"
            style={svgPrimaryColorFilter}
            src={closeIcon}
            alt="close"
            onClick={handleCloseModal}
          />
        </div>

        {editDescription && (
          <div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Notizfeld</span>
              </label>
              <textarea
                className="textarea textarea-primary"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
              />
            </div>
          </div>
        )}

        <div>
          <h3
            className="flex max-w-fit items-center cursor-pointer gap-2"
            onClick={() => {
              copyCodeToClipBoard(directLink);
            }}
          >
            <img className="w-6 h-6" src={copyIcon} alt="copy" />
            Direkt Link
          </h3>
          <code className="break-all text-sm">{directLink}</code>
        </div>

        <div>
          <h3
            className="flex max-w-fit items-center cursor-pointer gap-2"
            onClick={async () => {
              const qrCodeLabel =
                label ||
                snapshot?.snapshot.placesLocation.label ||
                "AreaButler";

              saveAs(
                await getQrCodeBase64(directLink),
                `${qrCodeLabel.replace(/[\s|,]+/g, "-")}-QR-Code.png`
              );
            }}
          >
            <img
              className="w-6 h-6"
              src={downloadIcon}
              alt="download-qr-code"
            />
            QR Code
          </h3>
        </div>

        <div>
          <h3
            className="flex max-w-fit items-center cursor-pointer gap-2"
            onClick={() => {
              copyCodeToClipBoard(codeSnippet);
            }}
          >
            <img className="w-6 h-6" src={copyIcon} alt="copy" />
            HTML Snippet
          </h3>
          <code className="break-all text-sm">{codeSnippet}</code>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;
