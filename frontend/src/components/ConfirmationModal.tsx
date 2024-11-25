import { FunctionComponent, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

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
  const { t } = useTranslation();
  useEscape(closeModal);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="modal modal-open z-9000">
      <div className="modal-box">
        <div className="text-lg">{text}</div>

        <div className="modal-action">
          <button
            type="button"
            onClick={closeModal}
            className="btn btn-sm"
            style={{ flexBasis: "25%" }} // class basis-1/4 doesn't work for some reason
          >
            {t(IntlKeys.common.no)}
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
            {t(IntlKeys.common.yes)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
