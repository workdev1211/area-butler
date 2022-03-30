import React from "react";

export interface BusyModalProps {
  open: boolean;
  title: string;
}

const BusyModal: React.FunctionComponent<BusyModalProps> = ({
  open,
  title
}) => {
  if (!open) {
    return null;
  }

  return (
    open && (
      <div className="modal modal-open z-9999">
        <div className="modal-box">
          <p>{title}</p>
        </div>
      </div>
    )
  );
};

export default BusyModal;
