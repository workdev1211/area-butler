import { EntityGroup, ResultEntity } from "components/SearchResultContainer";
import React, { useState } from "react";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  ApiSnippetEntitVisiblity,
  MeansOfTransportation
} from "../../../shared/types/types";
import "./EditorMapMenu.scss";
import { LocalityItemContent } from "../components/LocalityItem";
import ColorPicker from "components/ColorPicker";
import ImageUpload from "components/ImageUpload";
import {
  realEstateListingsTitle,
  realEstateListingsTitleEmbed
} from "../shared/shared.functions";

export interface EditorMapMenuProps {
  availableMeans: MeansOfTransportation[];
  groupedEntries: EntityGroup[];
  config: ApiSearchResultSnapshotConfig;
  onConfigChange: (config: ApiSearchResultSnapshotConfig) => void;
  additionalMapBoxStyles?: { key: string; label: string }[];
}

const EditorMapMenu: React.FunctionComponent<EditorMapMenuProps> = ({
  config,
  onConfigChange,
  availableMeans = [],
  groupedEntries = [],
  additionalMapBoxStyles = []
}) => {
  const [configOptionsOpen, setConfigOptionsOpen] = useState<boolean>(true);
  const [poiVisibilityOpen, setPoiVisibilityOpen] = useState<boolean>(true);
  const [poiGroupsOpen, setPoiGroupsOpen] = useState<string[]>([]);

  const [color, setColor] = useState(config?.primaryColor);
  const [mapIcon, setMapIcon] = useState(config?.mapIcon);

  const mapStyles: { key: string; label: string }[] = [
    { key: "kudiba-tech/ckvu0ltho2j9214p847jp4t4m", label: "Classic" },
    { key: "kudiba-tech/ckzbqgya2000414li19g3p9u1", label: "Highlight" },
    ...additionalMapBoxStyles
  ];

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

  const changeEntityVisiblity = (visiblity: ApiSnippetEntitVisiblity[]) => {
    onConfigChange({ ...config, entityVisibility: [...visiblity] });
  };

  const changeColor = (color: string | undefined) => {
    setColor(color);
    onConfigChange({ ...config, primaryColor: color });
  };

  const changeMapIcon = (mapIcon: string | undefined) => {
    setMapIcon(mapIcon);
    onConfigChange({ ...config, mapIcon: mapIcon });
  };

  const changeDefaultActiveMeans = (activeMeans: MeansOfTransportation) => {
    let defaultActiveMeans = config.defaultActiveMeans || [];
    if (defaultActiveMeans.includes(activeMeans)) {
      defaultActiveMeans = [
        ...defaultActiveMeans.filter(a => a !== activeMeans)
      ];
    } else {
      defaultActiveMeans.push(activeMeans);
    }
    onConfigChange({ ...config, defaultActiveMeans });
  };

  const isGroupOpen = (group: EntityGroup) => {
    return poiGroupsOpen.includes(group.title);
  };

  const toggleGroupOpen = (group: EntityGroup) => {
    if (isGroupOpen(group)) {
      setPoiGroupsOpen(poiGroupsOpen.filter(g => g !== group.title));
    } else {
      setPoiGroupsOpen([...poiGroupsOpen, group.title]);
    }
  };

  const isGroupHidden = (group: EntityGroup) => {
    const groupEntityIds = group.items.map(i => i.id);
    return groupEntityIds.every(id =>
      (config.entityVisibility || []).some(ev => ev.id === id && ev.excluded)
    );
  };

  const toggleGroupVisibility = (group: EntityGroup) => {
    const visiblityWithoutGroup = (config.entityVisibility || []).filter(
      ev => !group.items.some(i => i.id === ev.id)
    );
    const wasGroupHidden = isGroupHidden(group);
    const newGroup = [
      ...visiblityWithoutGroup,
      ...group.items.map(i => ({
        id: i.id,
        excluded: !wasGroupHidden
      }))
    ];
    changeEntityVisiblity(newGroup);
  };

  const isEntityHidden = (entity: ResultEntity) => {
    return (config.entityVisibility || []).some(
      ev => ev.id === entity.id && ev.excluded
    );
  };

  const toggleEntityVisibility = (entity: ResultEntity) => {
    const newGroup = [
      ...(config.entityVisibility || []).filter(ev => ev.id !== entity.id),
      {
        id: entity.id,
        excluded: !isEntityHidden(entity)
      }
    ];
    changeEntityVisiblity(newGroup);
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
          onChange={event => setConfigOptionsOpen(event.target.checked)}
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
                <select
                  className="select select-bordered select-sm w-full flex"
                  value={
                    config?.mapBoxMapId ||
                    "kudiba-tech/ckvu0ltho2j9214p847jp4t4m"
                  }
                  onChange={event => changeMapboxMap(event.target.value)}
                >
                  {mapStyles.map(style => (
                    <option value={style.key} key={style.key}>
                      {style.label}
                    </option>
                  ))}
                </select>
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
              <div className="flex items-center gap-6 py-1">
                <ColorPicker
                  label="Primärfarbe"
                  color={color}
                  setColor={setColor}
                  onChange={color => changeColor(color)}
                ></ColorPicker>
                {config?.primaryColor && (
                  <button
                    className="text-sm"
                    onClick={() => changeColor(undefined)}
                  >
                    Farbe Zurücksetzen
                  </button>
                )}
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <ImageUpload
                  label="Karten Icon"
                  uploadLabel="Icon hochladen"
                  inputId="map-icon-upload-button"
                  image={mapIcon}
                  setImage={setMapIcon}
                  onChange={mapIcon => changeMapIcon(mapIcon)}
                ></ImageUpload>
                {config?.mapIcon && (
                  <button
                    className="text-sm"
                    onClick={() => changeMapIcon(undefined)}
                  >
                    Icon Zurücksetzen
                  </button>
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div
        className={
          "collapse collapse-arrow view-option" +
          (poiVisibilityOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <input
          type="checkbox"
          onChange={event => setPoiVisibilityOpen(event.target.checked)}
        />
        <div className="collapse-title">POI Sichtbarkeit</div>
        <div className="collapse-content entity-groups">
          <ul>
            {groupedEntries
              .filter(ge => ge.items.length)
              .map(group => (
                <li key={group.title}>
                  <div className="flex flex-col">
                    <div className="flex items-center py-4">
                      <input
                        type="checkbox"
                        checked={!isGroupHidden(group)}
                        className="checkbox checkbox-primary"
                        onChange={() => toggleGroupVisibility(group)}
                      />
                      <h4 className="font-medium pl-2 cursor-pointer">
                        {group.title === realEstateListingsTitle
                          ? realEstateListingsTitleEmbed
                          : group.title}{" "}
                      </h4>
                      <button
                        className="btn-sm btn-link"
                        onClick={() => toggleGroupOpen(group)}
                      >
                        {isGroupOpen(group) ? "Schließen" : "Öffnen"}
                      </button>
                    </div>
                    {isGroupOpen(group) && (
                      <div className="group-items flex flex-col pl-2">
                        <ul>
                          {group.items.map(item => (
                            <li key={item.id}>
                              <div className="item-title">
                                <input
                                  type="checkbox"
                                  checked={!isEntityHidden(item)}
                                  className="checkbox checkbox-xs"
                                  onChange={() => toggleEntityVisibility(item)}
                                />{" "}
                                <span>{item.name ?? item.label}</span>
                              </div>
                              <LocalityItemContent item={item} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditorMapMenu;
