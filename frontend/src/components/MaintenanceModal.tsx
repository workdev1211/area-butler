import { FunctionComponent } from "react";

import closeIcon from "../assets/icons/cross.svg";

interface MaintenanceModalProps {
  onClose: () => void;
}

const MaintenanceModal: FunctionComponent<MaintenanceModalProps> = ({
  onClose,
  children,
}) => {
  return (
    <div className="modal modal-open z-9999 backdrop-blur-sm">
      <div className="modal-box p-0 sm:rounded-2xl">
        <div
          className="flex justify-between px-6 py-3 rounded-t-2xl text-white"
          style={{ background: "var(--primary)" }}
        >
          <span className="text-lg font-medium">Wartungsarbeiten</span>
          <img
            className="cursor-pointer invert"
            src={closeIcon}
            alt="close"
            onClick={onClose}
          />
        </div>
        <div className="px-6 pt-3 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
