import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { ReactComponent as SaveIcon } from "../../../assets/icons/save.svg";
import MapMenuFooterLinks from "./MapMenuFooterLinks";

interface IMapMenuFooterProps {
  saveConfig?: () => Promise<void>;
}

const MapMenuFooter: FunctionComponent<IMapMenuFooterProps> = ({
  saveConfig = () => {},
}) => {
  const { t } = useTranslation();

  return (
    <div className="map-menu-footer">
      <div className="button-container">
        <a
          type="button"
          className="back-button btn w-full sm:w-auto mr-auto font-bold"
          style={{ background: "var(--primary-gradient)", color: "white" }}
          target={"_blank"}
          href={
            "https://areabutler.notion.site/AreaButler-Support-Bereich-82b853f363fe47738581e964fe77c828"
          }
          rel="noreferrer"
        >
          ? {t(IntlKeys.common.help)}
        </a>
        <MapMenuFooterLinks />
        <button
          type="button"
          className="save-button btn w-full sm:w-auto font-bold text-white flex flex-row align-middle px-10"
          onClick={saveConfig}
          data-tour="save-button"
        >
          <SaveIcon className="mr-2" />
          {t(IntlKeys.common.save)}
        </button>
      </div>
    </div>
  );
};

export default MapMenuFooter;
