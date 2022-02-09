import { EntityGroup } from "components/SearchResultContainer";
import { config } from "process";
import { useState } from "react";
import { ApiSearchResultSnapshotConfig } from "../../../shared/types/types";
import "./MapMenu.css";
import MapMenuCollapsable from "./MapMenuCollapsable";

export interface EditorMapMenuProps {
  groupedEntries: EntityGroup[];
  config: ApiSearchResultSnapshotConfig;
  onConfigChange: (config: ApiSearchResultSnapshotConfig) => void;
}

const EditorMapMenu: React.FunctionComponent<EditorMapMenuProps> = ({
  config,
}) => {
  const [configOptionsOpen, setConfigOptionsOpen] = useState<boolean>(true);

  return (
    <div className="map-menu z-9000">
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
            <li className="locality-option-li" key="list-item-zensus">
              <MapMenuCollapsable title="Karten Darstellung">
                <div className="p-6 card z-2500">
                  <div className="form-control z-2500">
                    <label className="justify-start pl-0 cursor-pointer label z-2500">
                      <span className="label-text">Classic</span>
                      <input
                        type="checkbox"
                        name="opt"
                        checked={config?.theme === "DEFAULT"}
                        className="checkbox checkbox-sm z-2500"
                        value=""
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="justify-start pl-0 cursor-pointer label">
                      <span className="label-text">Minimalist</span>
                      <input
                        type="checkbox"
                        name="opt"
                        checked={config?.theme === "DEFAULT"}
                        className="checkbox z-2500"
                        value=""
                      />
                    </label>
                  </div>
                </div>
              </MapMenuCollapsable>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditorMapMenu;
