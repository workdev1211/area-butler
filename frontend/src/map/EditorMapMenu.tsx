import { EntityGroup } from "components/SearchResultContainer";
import { useState } from "react";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  MeansOfTransportation,
} from "../../../shared/types/types";
import "./EditorMapMenu.css";

export interface EditorMapMenuProps {
  availableMeans: MeansOfTransportation[];
  groupedEntries: EntityGroup[];
  config: ApiSearchResultSnapshotConfig;
  onConfigChange: (config: ApiSearchResultSnapshotConfig) => void;
}

const EditorMapMenu: React.FunctionComponent<EditorMapMenuProps> = ({
  config,
  onConfigChange,
  availableMeans = [],
}) => {
  const [configOptionsOpen, setConfigOptionsOpen] = useState<boolean>(true);

  const changeTheme = (value: ApiSearchResultSnapshotConfigTheme) => {
    onConfigChange({ ...config, theme: value });
  };

  const changeMapboxMap = (value: string) => {
    onConfigChange({ ...config, mapBoxMapId: value });
  };

  const changeShowLocation = () => {
    onConfigChange({ ...config, showLocation: !config?.showLocation });
  };

  const changeGroupItems = () => {
    onConfigChange({ ...config, groupItems: !config?.groupItems });
  };

  const changeDefaultActiveMeans = (activeMeans: MeansOfTransportation) => {
    let defaultActiveMeans = config.defaultActiveMeans || [];
    if (defaultActiveMeans.includes(activeMeans)) {
      defaultActiveMeans = [
        ...defaultActiveMeans.filter((a) => a !== activeMeans),
      ];
    } else {
      defaultActiveMeans.push(activeMeans);
    }
    onConfigChange({ ...config, defaultActiveMeans });
  };

  return (
    <div className="editor-map-menu z-9000">
      <div
        className={
          "collapse collapse-arrow view-option" +
          (configOptionsOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <input
          type="checkbox"
          onChange={(event) => setConfigOptionsOpen(event.target.checked)}
        />
        <div className="collapse-title">Konfiguration</div>
        <div className="collapse-content">
          <ul>
            <li>
              <div className="flex items-center gap-6 py-1">
                <h4 className="w-12 font-bold">Theme</h4>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="theme"
                    checked={!config?.theme || config?.theme === "DEFAULT"}
                    onChange={() => changeTheme("DEFAULT")}
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">Classic</span>
                </label>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="theme"
                    checked={config?.theme === "KF"}
                    onChange={() => changeTheme("KF")}
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">Minimalist</span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <h4 className="w-12 font-bold">Karte</h4>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="mapboxMap"
                    checked={
                      !config?.mapBoxMapId ||
                      config?.mapBoxMapId ===
                        "kudiba-tech/ckvu0ltho2j9214p847jp4t4m"
                    }
                    onChange={() =>
                      changeMapboxMap("kudiba-tech/ckvu0ltho2j9214p847jp4t4m")
                    }
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">Classic</span>
                </label>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="mapboxMap"
                    checked={
                      config?.mapBoxMapId ===
                      "kudiba-tech/ckzbqgya2000414li19g3p9u1"
                    }
                    onChange={() =>
                      changeMapboxMap("kudiba-tech/ckzbqgya2000414li19g3p9u1")
                    }
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">Highlight</span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="showLocation"
                    checked={!!config?.showLocation}
                    onChange={() => changeShowLocation()}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">Objekt auf Karte anzeigen</span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="showLocation"
                    checked={!!config?.groupItems}
                    onChange={() => changeGroupItems()}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    Objekte gruppieren beim Rauszoomen
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex flex-col">
                <h4 className="font-bold">Vorausgewählte Profile</h4>
                <div className="flex items-center gap-6 py-1">
                  {availableMeans.includes(MeansOfTransportation.WALK) && (
                    <label className="cursor-pointer label">
                      <input
                        type="checkbox"
                        name="defaultActiveMeansWalk"
                        checked={
                          !config?.defaultActiveMeans ||
                          config.defaultActiveMeans.includes(
                            MeansOfTransportation.WALK
                          )
                        }
                        onChange={() =>
                          changeDefaultActiveMeans(MeansOfTransportation.WALK)
                        }
                        className="checkbox checkbox-xs checkbox-primary mr-2"
                      />
                      <span className="label-text">Zu Fuß</span>
                    </label>
                  )}
                  {availableMeans.includes(MeansOfTransportation.BICYCLE) && (
                    <label className="cursor-pointer label">
                      <input
                        type="checkbox"
                        name="defaultActiveMeansBike"
                        checked={
                          !config?.defaultActiveMeans ||
                          config.defaultActiveMeans.includes(
                            MeansOfTransportation.BICYCLE
                          )
                        }
                        onChange={() =>
                          changeDefaultActiveMeans(
                            MeansOfTransportation.BICYCLE
                          )
                        }
                        className="checkbox checkbox-xs checkbox-primary mr-2"
                      />
                      <span className="label-text">Fahrrad</span>
                    </label>
                  )}
                  {availableMeans.includes(MeansOfTransportation.CAR) && (
                    <label className="cursor-pointer label">
                      <input
                        type="checkbox"
                        name="defaultActiveMeansCar"
                        checked={
                          !config?.defaultActiveMeans ||
                          config.defaultActiveMeans.includes(
                            MeansOfTransportation.CAR
                          )
                        }
                        onChange={() =>
                          changeDefaultActiveMeans(MeansOfTransportation.CAR)
                        }
                        className="checkbox checkbox-xs checkbox-primary mr-2"
                      />
                      <span className="label-text">Auto</span>
                    </label>
                  )}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditorMapMenu;
