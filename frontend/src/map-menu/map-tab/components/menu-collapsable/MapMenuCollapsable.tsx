import { FunctionComponent, useState } from "react";

import "./MapMenuCollapsable.scss";

export interface MapMenuCollapsableProps {
  title: string;
  subscriptionCheck?: () => boolean;
  openUpgradeSubscriptionModal?: () => void;
  icon?: string;
}

const MapMenuCollapsable: FunctionComponent<MapMenuCollapsableProps> = ({
  title,
  subscriptionCheck = () => true,
  openUpgradeSubscriptionModal = () => true,
  icon,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    if (subscriptionCheck && !subscriptionCheck()) {
      openUpgradeSubscriptionModal();
      return;
    }

    setOpen(!open);
  };

  return (
    <div className="map-menu-collapsable">
      <div
        className={
          "collapse collapse-arrow" +
          (open ? " collapse-open" : " collapse-closed")
        }
      >
        <div className="collapse-title" onClick={toggleOpen}>
          {icon && (
            <img
              className="w-4 h-4"
              src={icon}
              alt="copy"
              style={{ filter: "grayscale(100%) brightness(0)" }}
            />
          )}
          {title}
        </div>
        <div className="collapse-content">{children}</div>
      </div>
    </div>
  );
};

export default MapMenuCollapsable;
