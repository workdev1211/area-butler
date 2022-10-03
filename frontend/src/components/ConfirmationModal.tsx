import { FunctionComponent, useEffect } from "react";

export interface ConfirmationModalProps {
  isShownModal: boolean;
  closeModal: () => void;
  onConfirm: () => void;
  text: string;
}

const ConfirmationModal: FunctionComponent<ConfirmationModalProps> = ({
  isShownModal = false,
  closeModal,
  onConfirm,
  text,
}) => {
  // TODO make a common modal component in future
  useEffect(() => {
    const handleEscape = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
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
      <div className="modal-box">
        <div className="text-lg">{text}</div>

        <div className="modal-action">
          <button
            type="button"
            onClick={() => {
              closeModal();
            }}
            className="btn btn-sm"
            style={{ flexBasis: "25%" }} // class basis-1/4 doesn't work for some reason
          >
            Nein
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className="btn btn-sm btn-primary"
            style={{ flexBasis: "25%" }}
          >
            Ja
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
