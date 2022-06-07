import { FunctionComponent, CSSProperties, useEffect, useState } from "react";

import "./BusyModal.scss";
import areaButlerIcon from "../assets/icons/icons-20-x-20-outline-ic-ab.svg";
import { busyModalMessages } from "../shared/shared.messages";

export interface IBusyModalItem {
  key: string;
  text?: string;
}

interface IBusyModalProps {
  items: IBusyModalItem[];
  totalItems?: number;
  isRandomMessages?: boolean;
  isAnimated?: boolean;
}

const BusyModal: FunctionComponent<IBusyModalProps> = ({
  items,
  totalItems,
  isRandomMessages,
  isAnimated,
}) => {
  const [randomMessages, setRandomMessages] = useState<string[]>([]);

  useEffect(() => {
    if (isRandomMessages && totalItems) {
      let messages = [...busyModalMessages];
      const resultingMessages = [];

      for (let i = 0; i < totalItems; i += 1) {
        if (!messages.length) {
          messages = [...busyModalMessages];
        }

        const randomMessageNumber = Math.floor(Math.random() * messages.length);
        const randomMessage = messages.splice(randomMessageNumber, 1);
        resultingMessages.push(...randomMessage);
      }

      setRandomMessages(resultingMessages);
    }
  }, [isRandomMessages, totalItems]);

  let filledPercentage: number;
  let filledProgressBarStyle: CSSProperties;

  if (totalItems) {
    filledPercentage = Math.round(((items.length - 1) / totalItems) * 100);

    filledProgressBarStyle = {
      width: `${filledPercentage}%`,
      transition: "width 1s ease-in-out",
    };
  }

  return (
    <div className="busy-modal modal modal-open z-9999">
      <div className="modal-box">
        <div className="modal-header">Wird geladen</div>
        <div className="modal-content">
          {items.map((item, i) => (
            <div key={item.key}>
              {isAnimated && (
                <>
                  <img
                    className="animated-butler"
                    src={areaButlerIcon}
                    alt="area-butler-icon"
                  />
                  <svg className="animated-check" viewBox="0 0 24 24">
                    <path d="M4.1 12.7L9 17.6 20.3 6.3" fill="none" />
                  </svg>
                </>
              )}
              <span>{isRandomMessages ? randomMessages[i] : item.text}</span>
            </div>
          ))}
          {totalItems && (
            <div className="progress-bar">
              <div
                className="filled-progress-bar"
                style={filledProgressBarStyle!}
              >
                {filledPercentage!}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusyModal;
