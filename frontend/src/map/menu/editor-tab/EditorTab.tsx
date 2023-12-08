import { FunctionComponent, useEffect, useState } from "react";

import "./EditorTab.scss";

import {
  EntityGroup,
  IEditorTabProps,
  ResultEntity,
} from "shared/search-result.types";
import {
  ApiSearchResultSnapshotConfigTheme,
  MeansOfTransportation,
} from "../../../../../shared/types/types";
import { LocalityItemContent } from "../components/menu-item/locality-item/LocalityItem";
import ColorPicker from "components/ColorPicker";
import ImageUpload from "components/ImageUpload";
import {
  isEntityHidden,
  setBackgroundColor,
  toggleEntityVisibility,
} from "../../../shared/shared.functions";
import { IApiRealEstStatusByUser } from "../../../../../shared/types/real-estate";
import {
  realEstAllTextStatus,
  realEstateListingsTitle,
  realEstateListingsTitleEmbed,
} from "../../../../../shared/constants/real-estate";
import configOptionsIcon from "../../../assets/icons/map-menu/04-konfiguration.svg";
import poiVisibilityIcon from "../../../assets/icons/map-menu/06-poi-sichtbarkeit.svg";
import {
  defaultMapboxStyles,
  TMapboxStyleLabels,
} from "../../../shared/shared.constants";
import PoiFilter from "./components/PoiFilter";
import IconSizes from "./components/IconSizes";
import { useLocationData } from "../../../hooks/locationdata";
import { truncateText } from "../../../../../shared/functions/shared.functions";
import { IApiLateSnapConfigOption } from "../../../../../shared/types/location";
import { useRealEstateData } from "../../../hooks/realestatedata";
import { useTools } from "../../../hooks/tools";

const currentSnippetConfigLabel = "Aktuell";

const EditorTab: FunctionComponent<IEditorTabProps> = ({
  availableMeans = [],
  groupedEntries = [],
  config,
  onConfigChange,
  snapshotId,
  extraMapboxStyles = [],
  isNewSnapshot = false,
}) => {
  const { getActualUser } = useTools();
  const { fetchLateSnapConfigs } = useLocationData();
  const { fetchRealEstStatuses } = useRealEstateData();
  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;

  const [isConfigOptionsOpen, setIsConfigOptionsOpen] = useState(false);
  const [isPoiVisibilityOpen, setIsPoiVisibilityOpen] = useState(false);
  const [poiGroupsOpen, setPoiGroupsOpen] = useState<string[]>([]);
  const [color, setColor] = useState(config?.primaryColor);
  const [mapIcon, setMapIcon] = useState(config?.mapIcon);
  const [lateSnapConfigs, setLateSnapConfigs] = useState<
    IApiLateSnapConfigOption[]
  >([]);
  const [selectedSnippetConfigId, setSelectedSnippetConfigId] = useState(
    currentSnippetConfigLabel.toLowerCase()
  );
  const [isReferenceMap, setIsReferenceMap] = useState<boolean>(
    !!(config.hideMeanToggles && config.hideMapMenu && config.hidePoiIcons)
  );
  const [realEstStatuses, setRealEstStatuses] =
    useState<IApiRealEstStatusByUser>({ status: [], status2: [] });

  useEffect(() => {
    if (!config.defaultActiveGroups && groupedEntries?.length) {
      onConfigChange({
        ...config,
        defaultActiveGroups: groupedEntries.map((g) => g.title),
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, groupedEntries]);

  useEffect(() => {
    const fetchEmbeddableMaps = async (): Promise<void> => {
      const lateSnapConfResponse = await fetchLateSnapConfigs(
        isNewSnapshot ? 6 : 5
      );

      const snapshotConfigs = lateSnapConfResponse.reduce<
        IApiLateSnapConfigOption[]
      >((result, snapshotConfig) => {
        if (
          !snapshotConfig.id ||
          !snapshotConfig.label ||
          !snapshotConfig.config ||
          result.length === 5 ||
          (snapshotConfig.id === snapshotId && isNewSnapshot)
        ) {
          return result;
        }

        result.push(snapshotConfig);

        return result;
      }, []);

      setLateSnapConfigs(snapshotConfigs);
    };

    void fetchEmbeddableMaps();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getRealEstStatuses = async (): Promise<void> => {
      const fetchedStatuses = await fetchRealEstStatuses();
      setRealEstStatuses(fetchedStatuses);
    };

    void getRealEstStatuses();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapStyles: Array<{
    key: string;
    label: TMapboxStyleLabels;
    isDisabled?: boolean;
  }> = [
    ...defaultMapboxStyles,
    ...extraMapboxStyles,
    {
      key: "new-map-style-1",
      label: "> Karte in Ihrem Branding? <",
      isDisabled: true,
    },
    {
      key: "new-map-style-2",
      label: "> Sprechen Sie uns an. <",
      isDisabled: true,
    },
  ];

  const changeConfigParam = <T,>(paramName: string, value: T): void => {
    onConfigChange({ ...config, [paramName]: value });
  };

  const changeTheme = (value: ApiSearchResultSnapshotConfigTheme): void => {
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

  const changeColor = (color: string | undefined): void => {
    setColor(color);
    onConfigChange({ ...config, primaryColor: color });
  };

  const changeMapIcon = (newMapIcon: string | undefined): void => {
    setMapIcon(newMapIcon);
    onConfigChange({ ...config, mapIcon: newMapIcon });
  };

  const changeDefaultActiveMeans = (
    activeMeans: MeansOfTransportation
  ): void => {
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

  const isGroupOpen = (group: EntityGroup): boolean =>
    poiGroupsOpen.includes(group.title);

  const toggleGroupOpen = (group: EntityGroup): void => {
    if (isGroupOpen(group)) {
      setPoiGroupsOpen(poiGroupsOpen.filter((g) => g !== group.title));
    } else {
      setPoiGroupsOpen([...poiGroupsOpen, group.title]);
    }
  };

  const checkIsGroupHidden = (group: EntityGroup): boolean => {
    const groupEntityIds = group.items.map((i) => i.id);

    return groupEntityIds.every((id) =>
      (config.entityVisibility || []).some((ev) => ev.id === id && ev.excluded)
    );
  };

  const toggleGroupVisibility = (group: EntityGroup): void => {
    const visibilityWithoutGroup = (config.entityVisibility || []).filter(
      (ev) => !group.items.some((i) => i.id === ev.id)
    );

    const isGroupHidden = checkIsGroupHidden(group);

    const newGroup = [
      ...visibilityWithoutGroup,
      ...group.items.map((i) => ({
        id: i.id,
        osmName: i.osmName,
        excluded: !isGroupHidden,
      })),
    ];

    changeConfigParam("entityVisibility", [...newGroup]);
  };

  const toggleSingleEntityVisibility = (entity: ResultEntity): void => {
    changeConfigParam("entityVisibility", [
      ...toggleEntityVisibility(entity, config),
    ]);
  };

  const handleSetIsRefMap = (): void => {
    onConfigChange({
      ...config,
      hideMeanToggles: !isReferenceMap,
      hideMapMenu: !isReferenceMap,
      hidePoiIcons: !isReferenceMap,
    });

    setIsReferenceMap(!isReferenceMap);
  };

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  return (
    <div className="editor-tab z-9000" data-tour="editor-map-menu">
      <div
        className={
          "collapse collapse-arrow view-option" +
          (isPoiVisibilityOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <div
          className="collapse-title"
          ref={(node) => {
            setBackgroundColor(node, backgroundColor);
          }}
          onClick={() => {
            setIsPoiVisibilityOpen(!isPoiVisibilityOpen);
          }}
        >
          <div className="collapse-title-container">
            <img src={poiVisibilityIcon} alt="poi-visibility-icon" />
            <div className="collapse-title-text">
              <div className="collapse-title-text-1">POI-Detail-Filter</div>
              <div className="collapse-title-text-2">
                Einzelne POIs ausblenden
              </div>
            </div>
          </div>
        </div>
        <div className="collapse-content entity-groups">
          <ul>
            {groupedEntries.length > 0 && (
              <li>
                <PoiFilter
                  poiFilter={config.poiFilter}
                  onChange={(resultPoiFilter) => {
                    changeConfigParam("poiFilter", { ...resultPoiFilter });
                  }}
                />
              </li>
            )}
            {groupedEntries
              .filter((ge) => ge.items.length)
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((group) => (
                <li key={group.title}>
                  <div className="flex flex-col">
                    <div className="flex items-center py-4">
                      <input
                        type="checkbox"
                        checked={!checkIsGroupHidden(group)}
                        className="checkbox checkbox-primary"
                        onChange={() => {
                          toggleGroupVisibility(group);
                        }}
                      />
                      <h4 className="font-medium pl-2 cursor-pointer">
                        {group.title === realEstateListingsTitle
                          ? realEstateListingsTitleEmbed
                          : group.title}{" "}
                      </h4>
                      <button
                        className="btn-sm btn-link"
                        onClick={() => {
                          toggleGroupOpen(group);
                        }}
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
                                  onChange={() => {
                                    toggleSingleEntityVisibility(item);
                                  }}
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

      <div
        className={
          "collapse collapse-arrow view-option" +
          (isConfigOptionsOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <div
          className="collapse-title"
          ref={(node) => {
            setBackgroundColor(node, backgroundColor);
          }}
          onClick={() => {
            setIsConfigOptionsOpen(!isConfigOptionsOpen);
          }}
        >
          <div className="collapse-title-container">
            <img src={configOptionsIcon} alt="config-options-icon" />
            <div className="collapse-title-text">
              <div className="collapse-title-text-1">Konfiguration</div>
              <div className="collapse-title-text-2">
                Design, Farbe, Verhalten
              </div>
            </div>
          </div>
        </div>
        <div className="collapse-content">
          <ul className="editor-configuration-list">
            {lateSnapConfigs.length > 0 && (
              <li>
                <div className="flex items-center gap-6 py-1 w-full">
                  <h4 className="w-[6.5rem] font-bold">Vorlagen</h4>
                  <select
                    className="select select-bordered select-sm flex-1 w-full"
                    value={selectedSnippetConfigId}
                    disabled={lateSnapConfigs.length === 1}
                    onChange={(e): void => {
                      const changedSnippetConfigId = e.target.value;
                      setSelectedSnippetConfigId(changedSnippetConfigId);

                      onConfigChange({
                        ...lateSnapConfigs.find(
                          ({ id }) => id === changedSnippetConfigId
                        )!.config,
                      });
                    }}
                  >
                    {lateSnapConfigs.map((snapshotConfig) => (
                      <option value={snapshotConfig.id} key={snapshotConfig.id}>
                        {truncateText(snapshotConfig.label, 45)}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            )}
            <li>
              <div className="flex items-center gap-6 py-1 w-full">
                <h4 className="w-[6.5rem] font-bold">Karten-Stil</h4>
                <select
                  className="select select-bordered select-sm flex-1 w-full"
                  value={
                    config?.mapBoxMapId ||
                    "kudiba-tech/ckvu0ltho2j9214p847jp4t4m"
                  }
                  onChange={(event) => {
                    changeConfigParam("mapBoxMapId", event.target.value);
                  }}
                >
                  {mapStyles.map((style) => (
                    <option
                      value={style.key}
                      key={style.key}
                      disabled={!!style.isDisabled}
                    >
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1 w-full">
                <h4 className="w-[6.5rem] font-bold">Status</h4>
                <select
                  className="select select-bordered select-sm flex-1 w-full"
                  value={config?.realEstateStatus || realEstAllTextStatus}
                  onChange={(event) => {
                    changeConfigParam(
                      "realEstateStatus",
                      event.target.value !== realEstAllTextStatus
                        ? event.target.value
                        : undefined
                    );
                  }}
                >
                  {realEstStatuses.status.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1 w-full">
                <h4 className="w-[6.5rem] font-bold">Extra-Status</h4>
                <select
                  className="select select-bordered select-sm flex-1 w-full"
                  value={config?.realEstateStatus2 || realEstAllTextStatus}
                  onChange={(event) => {
                    changeConfigParam(
                      "realEstateStatus2",
                      event.target.value !== realEstAllTextStatus
                        ? event.target.value
                        : undefined
                    );
                  }}
                >
                  {realEstStatuses.status2.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1 w-full">
                <h4 className="w-[6.5rem] font-bold">Menü-Stil</h4>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="theme"
                    checked={!config?.theme || config?.theme === "DEFAULT"}
                    onChange={() => {
                      changeTheme("DEFAULT");
                    }}
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">Standard</span>
                </label>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="theme"
                    checked={config?.theme === "KF"}
                    onChange={() => {
                      changeTheme("KF");
                    }}
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">Minimal</span>
                </label>
              </div>
            </li>
            <li>
              <IconSizes
                iconSizes={config?.iconSizes}
                onChange={(resultingIconSizes) => {
                  changeConfigParam("iconSizes", { ...resultingIconSizes });
                }}
              />
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
                        onChange={() => {
                          changeDefaultActiveMeans(MeansOfTransportation.WALK);
                        }}
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
                        onChange={() => {
                          changeDefaultActiveMeans(
                            MeansOfTransportation.BICYCLE
                          );
                        }}
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
                        onChange={() => {
                          changeDefaultActiveMeans(MeansOfTransportation.CAR);
                        }}
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
                    onChange={() => {
                      changeConfigParam("showLocation", !config?.showLocation);
                    }}
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
                    onChange={() => {
                      changeConfigParam("showAddress", !config?.showAddress);
                    }}
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
                    name="showStreetViewLink"
                    checked={!!config?.showStreetViewLink}
                    onChange={() => {
                      changeConfigParam(
                        "showStreetViewLink",
                        !config?.showStreetViewLink
                      );
                    }}
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
                    name="groupItems"
                    checked={!!config?.groupItems}
                    onChange={() => {
                      changeConfigParam("groupItems", !config?.groupItems);
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    POIs gruppieren beim Rauszoomen
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
                    checked={!!config?.fixedRealEstates}
                    onChange={() => {
                      changeConfigParam(
                        "fixedRealEstates",
                        !config?.fixedRealEstates
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    Neue "Meine Immobilien" in Zukunft anzeigen
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
                    checked={!!config?.hideIsochrones}
                    onChange={() => {
                      changeConfigParam(
                        "hideIsochrones",
                        !config?.hideIsochrones
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">Isochronen ausblenden</span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="showDetailsInOnePage"
                    checked={!!config?.showDetailsInOnePage}
                    onChange={() => {
                      changeConfigParam(
                        "showDetailsInOnePage",
                        !config?.showDetailsInOnePage
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    Objekt Infos in Lage-Exposé anzeigen
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="isMapMenuCollapsed"
                    checked={!!config?.isMapMenuCollapsed}
                    onChange={() => {
                      changeConfigParam(
                        "isMapMenuCollapsed",
                        !config?.isMapMenuCollapsed
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    Kartenmenü im Iframe minimieren
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="isMapMenuCollapsed"
                    checked={isReferenceMap}
                    onChange={handleSetIsRefMap}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">Referenzkarte</span>
                </label>
              </div>
            </li>

            {isIntegrationUser
              ? ["web89711-21", "web89711-31", "web91649-21"].includes(
                  user.integrationUserId
                )
              : [
                  "atr@areabutler.de",
                  "a.timper@area-butler.de",
                  "vladimir.kuznetsov@brocoders.team",
                ].includes(user.email) && (
                  <li>
                    <div className="flex items-center gap-6 py-1">
                      <label className="cursor-pointer label">
                        <input
                          type="checkbox"
                          name="isFilterMenuAvail"
                          checked={!!config?.isFilterMenuAvail}
                          onChange={() => {
                            changeConfigParam(
                              "isFilterMenuAvail",
                              !config?.isFilterMenuAvail
                            );
                          }}
                          className="checkbox checkbox-xs checkbox-primary mr-2"
                        />
                        <span className="label-text">
                          Bedürfnisfilter für Immobilien
                        </span>
                      </label>
                    </div>
                  </li>
                )}

            <li>
              <div className="flex items-center gap-6 py-1">
                <ColorPicker
                  label="Primärfarbe"
                  color={color}
                  setColor={setColor}
                  onChange={(color) => {
                    changeColor(color);
                  }}
                />
                {config?.primaryColor && (
                  <button
                    className="text-sm"
                    onClick={() => {
                      changeColor(undefined);
                    }}
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
                  onChange={(newMapIcon) => {
                    changeMapIcon(newMapIcon);
                  }}
                />
                {config?.mapIcon && (
                  <button
                    className="text-sm"
                    onClick={() => {
                      changeMapIcon(undefined);
                    }}
                  >
                    Icon Zurücksetzen
                  </button>
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditorTab;
