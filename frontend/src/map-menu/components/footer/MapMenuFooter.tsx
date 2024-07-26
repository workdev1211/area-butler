import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { ReactComponent as SaveIcon } from "../../../assets/icons/save.svg";
import MapMenuFooterLinks from "./MapMenuFooterLinks";
import { useHistory } from "react-router-dom";

interface IMapMenuFooterProps {
  saveConfig?: () => Promise<void>;
}

const MapMenuFooter: FunctionComponent<IMapMenuFooterProps> = ({
  saveConfig = () => {},
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <div className="map-menu-footer">
      <div className="button-container">
        <button
          type="button"
          className="back-button btn w-full sm:w-auto mr-auto font-bold"
          style={{ background: "var(--primary-gradient)", color: "white" }}
          onClick={() => {
            history.push(
              "https://areabutler.notion.site/AreaButler-Support-Bereich-82b853f363fe47738581e964fe77c828"
            );
          }}
        >
          ? {t(IntlKeys.common.help)}
        </button>
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
