import { useState } from "react";
import "./MapMenuCollapsable.scss";

export interface MapMenuCollapsableProps {
  title: string;
  subscriptionCheck?: () => boolean;
  openUpgradeSubcriptionModal?: () => void;
}

const MapMenuCollapsable: React.FunctionComponent<MapMenuCollapsableProps> = ({
  title,
  subscriptionCheck = () => true,
  openUpgradeSubcriptionModal = () => true,
  children
}) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    if (!!subscriptionCheck && !subscriptionCheck()) {
      openUpgradeSubcriptionModal();
    } else {
      setOpen(!open);
    }
  };

  return (
    <div className="map-menu-collapsable">
      <div
        className={
          "collapse collapse-arrow" +
          (open ? " collapse-open" : " collapse-closed")
        }
      >
        <div className="collapse-title" onClick={() => toggleOpen()}>
          {title}
        </div>
        <div className="collapse-content">{children}</div>
      </div>
    </div>
  );
};

export default MapMenuCollapsable;
