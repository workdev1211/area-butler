import { FC, useState } from "react";
import UAParser from "ua-parser-js";

import MaintenanceModal from "./MaintenanceModal";

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
    <MaintenanceModal
      title="Bitte wechseln Sie Ihren Browser"
      onClose={(isDontShowAgain) => {
        if (isDontShowAgain) {
          window.localStorage.setItem(browserWarningKey, "false");
        }

        setIsBrowserWarningShown(false);
      }}
    >
      <div className="text-justify">
        Ihr aktueller <span className="font-bold">Browser</span> wird nicht
        unterstützt. Bitte verwenden Sie für die Erstellung von Karten &
        Analysen Chrome, zum Beispiel den{" "}
        <a
          className="link link-primary font-bold"
          target="_blank"
          rel="noreferrer"
          href="https://www.google.com/intl/de_de/chrome/"
        >
          Chrome
        </a>{" "}
        Browser auf PC oder Mac. Exportierte Karten & Inhalte funktionieren auf
        allen Geräten & Browsern. Danke für Ihr Verständnis!
      </div>
    </MaintenanceModal>
  );
};

export default BrowserWarningModal;
