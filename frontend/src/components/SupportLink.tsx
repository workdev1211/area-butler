import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";

const SupportLink: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <a
      type="button"
      className="feedback-button"
      href="https://areabutler.notion.site/AreaButler-Support-Bereich-82b853f363fe47738581e964fe77c828"
      target="_blank"
    >
      ?
    </a>
  );
};

export default SupportLink;
