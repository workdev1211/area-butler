import { FC, useState } from "react";

import closeIcon from "../assets/icons/cross.svg";

interface IInformationModalProps {
  title: string;
  onClose: (isDontShowAgain: boolean) => void;
  contentWidthRem?: number;
}

const InformationModal: FC<IInformationModalProps> = ({
  title,
  onClose,
  contentWidthRem,
  children,
}) => {
  const [isDontShowAgain, setIsDontShowAgain] = useState(false);
  const contentPaddingXRem = 1.5;

  return (
    <div className="modal modal-open z-9000 backdrop-blur-sm w-auto">
      <div
        className="modal-box p-0 sm:rounded-2xl"
        style={{
          maxWidth: contentWidthRem
            ? `calc(${contentWidthRem}rem + ${contentPaddingXRem}rem * 2)`
            : "auto",
        }}
      >
        <div
          className="flex justify-between px-6 py-3 rounded-t-2xl text-white"
          style={{ background: "var(--primary)" }}
        >
          <span className="text-lg font-medium">{title}</span>
          <img
            className="cursor-pointer invert"
            src={closeIcon}
            alt="close"
            onClick={() => {
              onClose(isDontShowAgain);
            }}
          />
        </div>
        <div
          className="py-3"
          style={{
            paddingLeft: `${contentPaddingXRem}rem`,
            paddingRight: `${contentPaddingXRem}rem`,
          }}
        >
          {children}
        </div>
        <div
          className="flex items-center px-6 py-3 rounded-b-2xl text-white gap-2"
          style={{ background: "var(--primary)" }}
        >
          <input
            type="checkbox"
            className="checkbox checkbox-secondary checkbox-sm"
            style={{ backgroundColor: "var(--secondary)" }}
            checked={isDontShowAgain}
            onChange={() => {
              setIsDontShowAgain(!isDontShowAgain);
            }}
          />
          <div>Nicht mehr zeigen</div>
        </div>
      </div>
    </div>
  );
};

export default InformationModal;
