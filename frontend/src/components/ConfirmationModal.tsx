import { FunctionComponent, useState } from "react";

import { useEscape } from "../hooks/escape";

interface IConfirmationModalProps {
  closeModal: () => void;
  onConfirm: () => void;
  text: string;
}

const ConfirmationModal: FunctionComponent<IConfirmationModalProps> = ({
  closeModal,
  onConfirm,
  text,
}) => {
  useEscape(closeModal);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="modal modal-open z-9999">
      <div className="modal-box">
        <div className="text-lg">{text}</div>

        <div className="modal-action">
          <button
            type="button"
            onClick={closeModal}
            className="btn btn-sm"
            style={{ flexBasis: "25%" }} // class basis-1/4 doesn't work for some reason
          >
            Nein
          </button>
          <button
            className={`btn bg-primary-gradient btn-sm self-end ${
              isLoading ? "loading" : ""
            }`}
            style={{ flexBasis: "25%" }}
            onClick={async () => {
              setIsLoading(true);
              await onConfirm();
              setIsLoading(false);
              closeModal();
            }}
          >
            Ja
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
