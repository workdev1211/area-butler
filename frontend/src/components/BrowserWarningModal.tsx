import { FC, useState } from "react";
import UAParser from "ua-parser-js";

import InformationModal from "./InformationModal";

const browserWarningKey = "is-browser-warning-shown";

const BrowserWarningModal: FC = () => {
  const parser = new UAParser();
  const engine = parser.getEngine().name;
  const os = parser.getOS().name;

  const [isBrowserWarningShown, setIsBrowserWarningShown] = useState<boolean>(
    (!["Blink"].includes(engine!) || os === "Android") &&
    window.localStorage.getItem(browserWarningKey) !== "false"
  );

  if (!isBrowserWarningShown) {
    return null;
  }

  return (
    <InformationModal
      title="Bitte wechseln Sie Ihren Browser"
      onClose={(isDontShowAgain) => {
        if (isDontShowAgain) {
          window.localStorage.setItem(browserWarningKey, "false");
        }

        setIsBrowserWarningShown(false);
      }}
    >
      <div className="text-justify">
        Your current <span className="font-bold">Browser</span> is not
        supported. Please use to create maps &
        Analyses Chrome, for example the{" "}
        <a
          className="link link-primary font-bold"
          target="_blank"
          rel="noreferrer"
          href="https://www.google.com/intl/de_de/chrome/"
        >
          Chrome
        </a>{" "}
        Browser on PC or Mac. Exported maps and content work on all devices and browsers. Thank you for your understanding!
      </div>
    </InformationModal>
  );
};

export default BrowserWarningModal;
