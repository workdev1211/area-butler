import { FunctionComponent, useContext, useState } from "react";

import { ApiSearchResultSnapshotConfig } from "../../../../../../../shared/types/types";
import { setBackgroundColor } from "../../../../../shared/shared.functions";
import configOptionsIcon from "../../../../../assets/icons/map-menu/04-konfiguration.svg";
import { SearchContext } from "../../../../../context/SearchContext";

interface IMapSettingsProps {
  saveConfig?: (config?: ApiSearchResultSnapshotConfig) => Promise<void>;
}

const MapSettings: FunctionComponent<IMapSettingsProps> = ({ saveConfig }) => {
  const {
    searchContextState: { responseConfig: config },
  } = useContext(SearchContext);

  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false);

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  const changeShowLocation = async () => {
    if (!saveConfig || !config) {
      return;
    }

    await saveConfig({
      ...config,
      showLocation: !config?.showLocation,
    });
  };

  const changeShowAddress = async () => {
    if (!saveConfig || !config) {
      return;
    }

    await saveConfig({
      ...config,
      showAddress: !config?.showAddress,
    });
  };

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isMapSettingsOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsMapSettingsOpen(!isMapSettingsOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={configOptionsIcon} alt="social-demographics-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">
              Adresse und/oder Objekt ausblenden
            </div>
            <div className="collapse-title-text-2">
              Was soll veröffentlicht werden?
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        <ul>
          <li>
            <div className="flex items-center gap-6 py-1">
              <label className="cursor-pointer label">
                <input
                  type="checkbox"
                  name="showLocation"
                  checked={!!config?.showLocation}
                  onChange={changeShowLocation}
                  className="checkbox checkbox-xs checkbox-primary mr-2"
                />
                <span className="label-text">Objekt anzeigen</span>
              </label>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-6 py-1">
              <label className="cursor-pointer label">
                <input
                  type="checkbox"
                  name="showAddress"
                  checked={!!config?.showAddress}
                  onChange={changeShowAddress}
                  className="checkbox checkbox-xs checkbox-primary mr-2"
                />
                <span className="label-text">Adresse anzeigen</span>
              </label>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MapSettings;
