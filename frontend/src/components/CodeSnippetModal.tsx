import { FunctionComponent, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";

import { UserActionTypes, UserContext } from "context/UserContext";
import { toastError, toastSuccess } from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import closeIcon from "../assets/icons/cross.svg";
import copyIcon from "../assets/icons/copy.svg";
import downloadIcon from "../assets/icons/download.svg";
import { svgPrimaryColorFilter } from "../shared/shared.constants";
import { getQrCodeBase64 } from "../export/QrCode";
import { useLocationData } from "../hooks/locationdata";

export interface CodeSnippetModalProps {
  codeSnippet: string;
  directLink: string;
  closeModal: () => void;
  editDescription?: boolean;
  snapshot?: ApiSearchResultSnapshotResponse;
  label?: string;
}

const CodeSnippetModal: FunctionComponent<CodeSnippetModalProps> = ({
  codeSnippet,
  directLink,
  closeModal,
  editDescription = false,
  snapshot,
  label,
}) => {
  const { t } = useTranslation();
  const { userDispatch } = useContext(UserContext);

  const { updateSnapshot } = useLocationData();

  const [description, setDescription] = useState(snapshot?.description);

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess(t(IntlKeys.common.successfullyCopiedToClipboard));
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
        await updateSnapshot(snapshot.id, { description });

        userDispatch({
          type: UserActionTypes.SET_EMBEDDABLE_MAP_DESCRIPTION,
          payload: { id: snapshot.id, description: description || "" },
        });
      } catch (err) {
        toastError(t(IntlKeys.mapSnapshots.changingNoteError));
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
  }, [description]);

  return (
    <div className="modal modal-open z-9000">
      <div className="modal-box flex flex-col">
        <div className="flex justify-between items-center">
          <div>{t(IntlKeys.mapSnapshots.yourCardSnippet)}</div>
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
                <span className="label-text">
                  {t(IntlKeys.mapSnapshots.noteField)}
                </span>
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
            {t(IntlKeys.mapSnapshots.directLink)}
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
            {t(IntlKeys.common.qrCode)}
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
            {t(IntlKeys.mapSnapshots.htmlSnippet)}
          </h3>
          <code className="break-all text-sm">{codeSnippet}</code>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;
