// TODO REMOVE IN THE FUTURE

import { FunctionComponent, useContext, useState } from "react";

import { setBackgroundColor } from "../../../../shared/shared.functions";
import configOptionsIcon from "../../../../assets/icons/map-menu/04-konfiguration.svg";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../context/SearchContext";

const MapSettings: FunctionComponent = () => {
  const {
    searchContextState: { responseConfig: config },
    searchContextDispatch,
  } = useContext(SearchContext);

  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false);

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  const toggleShowLocation = async () => {
    if (!config) {
      return;
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
      payload: {
        ...config,
        showLocation: !config?.showLocation,
      },
    });
  };

  const toggleShowAddress = async () => {
    if (!config) {
      return;
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
      payload: {
        ...config,
        showAddress: !config?.showAddress,
      },
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
                  onChange={toggleShowLocation}
                  className="checkbox checkbox-xs checkbox-primary mr-2"
                />
                <span className="label-text">Icon anzeigen</span>
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
                  onChange={toggleShowAddress}
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
