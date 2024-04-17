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
  isAnimated?: boolean;
  isDisabledLoadingBar?: boolean;
  isNotFromZero?: boolean;
  isRandomMessages?: boolean;
  itemCount?: number;
}

const BusyModal: FunctionComponent<IBusyModalProps> = ({
  items,
  isAnimated = true,
  isDisabledLoadingBar = true,
  isNotFromZero = false,
  isRandomMessages = false,
  itemCount,
}) => {
  const [randomMessages, setRandomMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!isRandomMessages || !itemCount) {
      return;
    }

    let messages = [...busyModalMessages];
    const resultMessages: string[] = [];

    for (let i = 0; i < itemCount; i += 1) {
      if (!messages.length) {
        messages = [...busyModalMessages];
      }

      const randomMessageNumber = Math.floor(Math.random() * messages.length);
      const randomMessage = messages.splice(randomMessageNumber, 1);
      resultMessages.push(...randomMessage);
    }

    setRandomMessages(resultMessages);
  }, [isRandomMessages, itemCount]);

  let filledPercentage: number;
  let filledProgressBarStyle: CSSProperties;

  if (itemCount) {
    filledPercentage = Math.round(
      ((items.length + (isNotFromZero ? 1 : 0)) /
        (itemCount + (isNotFromZero ? 1 : 0))) *
        100
    );

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
            <div
              key={item.key}
              style={
                isDisabledLoadingBar && items.length - 1 === i
                  ? { marginBottom: 0 }
                  : { marginBottom: "5px" }
              }
            >
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
          {isDisabledLoadingBar && <div />}
          {itemCount && !isDisabledLoadingBar && (
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
