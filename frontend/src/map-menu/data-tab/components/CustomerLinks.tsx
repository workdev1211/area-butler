// TODO waits for the customer

import { FunctionComponent, useState } from "react";

import { setBackgroundColor } from "../../../shared/shared.functions";
import webLinkIcon from "../../../assets/icons/link.svg";

interface ICustomerLinksProps {
  backgroundColor: string;
}

const CustomerLinks: FunctionComponent<ICustomerLinksProps> = ({
  backgroundColor,
}) => {
  const [isCustomerLinksOpen, setIsCustomerLinksOpen] = useState(false);

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isCustomerLinksOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsCustomerLinksOpen(!isCustomerLinksOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={webLinkIcon} alt="customer-links-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">Eigene Links</div>
            <div className="collapse-title-text-2">
              Hyperlinks zu externen Quellen oder Diensten
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        <div
          className="text-justify"
          style={{
            padding:
              "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
          }}
        >
          Hier könnten Sie Ihre Links speichern und mit KollegInnen teilen.
          Sprechen Sie uns für diese Funktion gerne an.
        </div>
      </div>
    </div>
  );
};

export default CustomerLinks;
