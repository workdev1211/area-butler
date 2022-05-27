import { FunctionComponent, useEffect, useState } from "react";

import { EntityGroup, ResultEntity } from "components/SearchResultContainer";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  ApiSnippetEntitVisiblity,
  MeansOfTransportation,
} from "../../../../shared/types/types";
import "./EditorMapMenu.scss";
import { LocalityItemContent } from "../menu/menu-item/locality-item/LocalityItem";
import ColorPicker from "components/ColorPicker";
import ImageUpload from "components/ImageUpload";
import {
  isEntityHidden,
  realEstateListingsTitle,
  realEstateListingsTitleEmbed,
  toggleEntityVisibility,
} from "../../shared/shared.functions";

export interface EditorMapMenuProps {
  availableMeans: MeansOfTransportation[];
  groupedEntries: EntityGroup[];
  config: ApiSearchResultSnapshotConfig;
  onConfigChange: (config: ApiSearchResultSnapshotConfig) => void;
  additionalMapBoxStyles?: { key: string; label: string }[];
}

const EditorMapMenu: FunctionComponent<EditorMapMenuProps> = ({
  config,
  onConfigChange,
  availableMeans = [],
  groupedEntries = [],
  additionalMapBoxStyles = [],
}) => {
  const [configOptionsOpen, setConfigOptionsOpen] = useState<boolean>(true);
  const [poiVisibilityOpen, setPoiVisibilityOpen] = useState<boolean>(true);
  const [preselectedGroupVisibilityOpen, setPreselectedGroupVisibilityOpen] =
    useState<boolean>(true);
  const [poiGroupsOpen, setPoiGroupsOpen] = useState<string[]>([]);

  const [color, setColor] = useState(config?.primaryColor);
  const [mapIcon, setMapIcon] = useState(config?.mapIcon);

  const mapStyles: { key: string; label: string }[] = [
    { key: "kudiba-tech/ckvu0ltho2j9214p847jp4t4m", label: "Classic" },
    { key: "kudiba-tech/ckzbqgya2000414li19g3p9u1", label: "Highlight" },
    { key: "kudiba-tech/cl11xlpo8002y14nq8zm5j2ob", label: "Satellite" },
    ...additionalMapBoxStyles,
  ];

  const changeTheme = (value: ApiSearchResultSnapshotConfigTheme) => {
    let newConfig = { ...config, theme: value };
    const oldGroups = config.defaultActiveGroups ?? [];
    if (value === "KF" && oldGroups.length > 1) {
      newConfig = {
        ...newConfig,
        defaultActiveGroups: [oldGroups[0]],
      };
    }
    onConfigChange({ ...newConfig });
  };

  const changeMapboxMap = (value: string) => {
    onConfigChange({ ...config, mapBoxMapId: value });
  };

  const changeShowLocation = () => {
    onConfigChange({ ...config, showLocation: !config?.showLocation });
  };

  const changeShowAddress = () => {
    onConfigChange({ ...config, showAddress: !config?.showAddress });
  };

  const changeGroupItems = () => {
    onConfigChange({ ...config, groupItems: !config?.groupItems });
  };

  const changeFixedRealEstates = () => {
    onConfigChange({ ...config, fixedRealEstates: !config?.fixedRealEstates });
  };

  const changeEntityVisiblity = (visiblity: ApiSnippetEntitVisiblity[]) => {
    onConfigChange({ ...config, entityVisibility: [...visiblity] });
  };

  const changeShowStreetViewLink = () => {
    onConfigChange({
      ...config,
      showStreetViewLink: !config.showStreetViewLink,
    });
  };

  const changeHideIsochrones = () => {
    onConfigChange({
      ...config,
      hideIsochrones: !config.hideIsochrones,
    });
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
        ...defaultActiveMeans.filter((a) => a !== activeMeans),
      ];
    } else {
      defaultActiveMeans.push(activeMeans);
    }
    onConfigChange({ ...config, defaultActiveMeans: [...defaultActiveMeans] });
  };

  const changeDefaultActiveGroups = (activeGroup: string) => {
    let defaultActiveGroups = config.defaultActiveGroups || [];
    if (defaultActiveGroups.includes(activeGroup)) {
      defaultActiveGroups = [
        ...defaultActiveGroups.filter((g) => g !== activeGroup),
      ];
    } else {
      if (config.theme === "KF") {
        defaultActiveGroups = [];
      }
      defaultActiveGroups.push(activeGroup);
    }
    onConfigChange({
      ...config,
      defaultActiveGroups: [...defaultActiveGroups],
    });
  };

  const isDefaultActiveGroup = (activeGroup: string) => {
    return (config.defaultActiveGroups ?? []).includes(activeGroup);
  };

  const isGroupOpen = (group: EntityGroup) => {
    return poiGroupsOpen.includes(group.title);
  };

  const toggleGroupOpen = (group: EntityGroup) => {
    if (isGroupOpen(group)) {
      setPoiGroupsOpen(poiGroupsOpen.filter((g) => g !== group.title));
    } else {
      setPoiGroupsOpen([...poiGroupsOpen, group.title]);
    }
  };

  const isGroupHidden = (group: EntityGroup) => {
    const groupEntityIds = group.items.map((i) => i.id);
    return groupEntityIds.every((id) =>
      (config.entityVisibility || []).some((ev) => ev.id === id && ev.excluded)
    );
  };

  const toggleGroupVisibility = (group: EntityGroup) => {
    const visiblityWithoutGroup = (config.entityVisibility || []).filter(
      (ev) => !group.items.some((i) => i.id === ev.id)
    );
    const wasGroupHidden = isGroupHidden(group);
    const newGroup = [
      ...visiblityWithoutGroup,
      ...group.items.map((i) => ({
        id: i.id,
        excluded: !wasGroupHidden,
      })),
    ];
    changeEntityVisiblity(newGroup);
  };

  useEffect(() => {
    if (!config.defaultActiveGroups && groupedEntries?.length) {
      onConfigChange({
        ...config,
        defaultActiveGroups: groupedEntries.map((g) => g.title),
      });
    }
  }, [config, groupedEntries, onConfigChange]);

  const toggleSingleEntityVisibility = (entity: ResultEntity) => {
    changeEntityVisiblity(toggleEntityVisibility(entity, config));
  };

  return (
    <div className="editor-map-menu z-9000" data-tour="editor-map-menu">
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
                <h4 className="w-12 font-bold">Menu</h4>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="theme"
                    checked={!config?.theme || config?.theme === "DEFAULT"}
                    onChange={() => changeTheme("DEFAULT")}
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">Standard</span>
                </label>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="theme"
                    checked={config?.theme === "KF"}
                    onChange={() => changeTheme("KF")}
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">Minimal</span>
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
                  onChange={(event) => changeMapboxMap(event.target.value)}
                >
                  {mapStyles.map((style) => (
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
                  <span className="label-text">Objekt anzeigen</span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="showLocation"
                    checked={!!config?.showAddress}
                    onChange={() => changeShowAddress()}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">Adresse anzeigen</span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="showLocation"
                    checked={!!config?.showStreetViewLink}
                    onChange={() => changeShowStreetViewLink()}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">Street View Link anzeigen</span>
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
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="fixedRealEstates"
                    checked={!config?.fixedRealEstates}
                    onChange={() => changeFixedRealEstates()}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    Neue Einträge in "Meine Immobilien" automatisch einfügen
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="hideIsochrones"
                    checked={config?.hideIsochrones}
                    onChange={() => changeHideIsochrones()}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    Grenzen der Bewegungsprofile ausblenden
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
                  onChange={(color) => changeColor(color)}
                />
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
                  onChange={(mapIcon) => changeMapIcon(mapIcon)}
                />
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
          (preselectedGroupVisibilityOpen
            ? " collapse-open"
            : " collapse-closed")
        }
      >
        <input
          type="checkbox"
          onChange={(event) =>
            setPreselectedGroupVisibilityOpen(event.target.checked)
          }
        />
        <div className="collapse-title">Vorausgewählte Kategorie</div>
        <div className="collapse-content preselected-groups">
          <ul>
            {groupedEntries
              .filter((ge) => ge.items.length)
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((group) => (
                <li key={group.title}>
                  <input
                    type="checkbox"
                    checked={isDefaultActiveGroup(group.title)}
                    className="checkbox checkbox-primary"
                    onChange={() => changeDefaultActiveGroups(group.title)}
                  />
                  <h4 className="font-medium pl-2">
                    {group.title === realEstateListingsTitle
                      ? realEstateListingsTitleEmbed
                      : group.title}{" "}
                  </h4>
                </li>
              ))}
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
          onChange={(event) => setPoiVisibilityOpen(event.target.checked)}
        />
        <div className="collapse-title">POI Sichtbarkeit</div>
        <div className="collapse-content entity-groups">
          <ul>
            {groupedEntries
              .filter((ge) => ge.items.length)
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((group) => (
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
                          {group.items.map((item) => (
                            <li key={item.id}>
                              <div className="item-title">
                                <input
                                  type="checkbox"
                                  checked={!isEntityHidden(item, config)}
                                  className="checkbox checkbox-xs"
                                  onChange={() =>
                                    toggleSingleEntityVisibility(item)
                                  }
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
