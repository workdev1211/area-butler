import { FunctionComponent, useEffect, useState } from "react";

import "./EditorTab.scss";
import {
  EntityGroup,
  IEditorTabProps,
  ResultEntity,
} from "components/SearchResultContainer";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  ApiSearchResultSnapshotResponse,
  ApiSnippetEntityVisibility,
  IApiSnapshotPoiFilter,
  IApiSnapshotIconSizes,
  MeansOfTransportation,
} from "../../../../../shared/types/types";
import { LocalityItemContent } from "../menu-item/locality-item/LocalityItem";
import ColorPicker from "components/ColorPicker";
import ImageUpload from "components/ImageUpload";
import {
  isEntityHidden,
  realEstateListingsTitle,
  realEstateListingsTitleEmbed,
  setBackgroundColor,
  toggleEntityVisibility,
} from "../../../shared/shared.functions";
import { useHttp } from "../../../hooks/http";
import { ApiRealEstateStatusEnum } from "../../../../../shared/types/real-estate";
import { allRealEstateStatuses } from "../../../../../shared/constants/real-estate";
import configOptionsIcon from "../../../assets/icons/map-menu/04-konfiguration.svg";
import preselectedCategoriesIcon from "../../../assets/icons/map-menu/05-vorausgewählte-kategorien.svg";
import poiVisibilityIcon from "../../../assets/icons/map-menu/06-poi-sichtbarkeit.svg";
import {
  defaultMapboxStyles,
  TMapboxStyleLabels,
} from "../../../shared/shared.constants";
import PoiFilter from "./PoiFilter";
import IconSizes from "./IconSize";

interface IRecentSnippetConfig {
  id: string;
  label: string;
  config: ApiSearchResultSnapshotConfig;
}

const currentSnippetConfigLabel = "Aktuell";

const EditorTab: FunctionComponent<IEditorTabProps> = ({
  availableMeans = [],
  groupedEntries = [],
  config,
  onConfigChange,
  snapshotId,
  additionalMapBoxStyles = [],
  isNewSnapshot = false,
}) => {
  const { get } = useHttp();

  const [isConfigOptionsOpen, setIsConfigOptionsOpen] = useState(false);
  const [isPreselectedCategoriesOpen, setIsPreselectedCategoriesOpen] =
    useState(false);
  const [isPoiVisibilityOpen, setIsPoiVisibilityOpen] = useState(false);
  const [poiGroupsOpen, setPoiGroupsOpen] = useState<string[]>([]);
  const [color, setColor] = useState(config?.primaryColor);
  const [mapIcon, setMapIcon] = useState(config?.mapIcon);
  const [recentSnippetConfigs, setRecentSnippetConfigs] = useState<
    IRecentSnippetConfig[]
  >([]);
  const [selectedSnippetConfigId, setSelectedSnippetConfigId] = useState(
    currentSnippetConfigLabel.toLowerCase()
  );

  useEffect(() => {
    if (!config.defaultActiveGroups && groupedEntries?.length) {
      onConfigChange({
        ...config,
        defaultActiveGroups: groupedEntries.map((g) => g.title),
      });
    }
  }, [config, groupedEntries, onConfigChange]);

  useEffect(() => {
    const fetchEmbeddableMaps = async () => {
      const limit = isNewSnapshot ? 6 : 5;

      const embeddableMaps: ApiSearchResultSnapshotResponse[] = (
        await get<ApiSearchResultSnapshotResponse[]>(
          `/api/location/snapshots?limit=${limit}&sort=${JSON.stringify({
            updatedAt: -1,
          })}`
        )
      ).data;

      const snippetConfigs = embeddableMaps.reduce<IRecentSnippetConfig[]>(
        (
          result,
          {
            id,
            snapshot: {
              placesLocation: { label },
            },
            config,
          }
        ) => {
          if (
            !id ||
            !label ||
            !config ||
            result.length === 5 ||
            (id === snapshotId && isNewSnapshot)
          ) {
            return result;
          }

          const snippetConfig = { config };

          if (id === snapshotId) {
            Object.assign(snippetConfig, {
              id: currentSnippetConfigLabel.toLowerCase(),
              label: currentSnippetConfigLabel,
            });
          } else {
            Object.assign(snippetConfig, { id, label });
          }

          result.push(snippetConfig as IRecentSnippetConfig);

          return result;
        },
        []
      );

      setRecentSnippetConfigs(snippetConfigs);
    };

    void fetchEmbeddableMaps();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapStyles: Array<{
    key: string;
    label: TMapboxStyleLabels;
    isDisabled?: boolean;
  }> = [
    ...defaultMapboxStyles,
    ...additionalMapBoxStyles,
    {
      key: "",
      label: "> Karte in Ihrem Branding? <",
      isDisabled: true,
    },
    {
      key: "",
      label: "> Sprechen Sie uns an. <",
      isDisabled: true,
    },
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

  const changeEntityVisibility = (visibility: ApiSnippetEntityVisibility[]) => {
    onConfigChange({ ...config, entityVisibility: [...visibility] });
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

  const changeShowDetailsInOnePage = () => {
    onConfigChange({
      ...config,
      showDetailsInOnePage: !config.showDetailsInOnePage,
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

  const changeDefaultActiveGroups = (activeGroup: string): void => {
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

  const changeRealEstateStatusFilter = (value: string) => {
    onConfigChange({
      ...config,
      realEstateStatus:
        value !== ApiRealEstateStatusEnum.ALLE
          ? (value as ApiRealEstateStatusEnum)
          : undefined,
    });
  };

  const changePoiFilter = (resultingPoiFilter: IApiSnapshotPoiFilter): void => {
    onConfigChange({
      ...config,
      poiFilter: { ...resultingPoiFilter },
    });
  };

  const changeIconSizes = (iconSizes: IApiSnapshotIconSizes): void => {
    onConfigChange({
      ...config,
      iconSizes: { ...iconSizes },
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
    const visibilityWithoutGroup = (config.entityVisibility || []).filter(
      (ev) => !group.items.some((i) => i.id === ev.id)
    );

    const wasGroupHidden = isGroupHidden(group);

    const newGroup = [
      ...visibilityWithoutGroup,
      ...group.items.map((i) => ({
        id: i.id,
        osmName: i.osmName,
        excluded: !wasGroupHidden,
      })),
    ];

    changeEntityVisibility(newGroup);
  };

  const toggleSingleEntityVisibility = (entity: ResultEntity): void => {
    changeEntityVisibility(toggleEntityVisibility(entity, config));
  };

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  return (
    <div className="editor-tab z-9000" data-tour="editor-map-menu">
      <div
        className={
          "collapse collapse-arrow view-option" +
          (isPreselectedCategoriesOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <div
          className="collapse-title"
          ref={(node) => {
            setBackgroundColor(node, backgroundColor);
          }}
          onClick={() => {
            setIsPreselectedCategoriesOpen(!isPreselectedCategoriesOpen);
          }}
        >
          <div className="collapse-title-container">
            <img
              src={preselectedCategoriesIcon}
              alt="preselected-categories-icon"
            />
            <div className="collapse-title-text">
              <div className="collapse-title-text-1">
                Vorausgewählte Kategorien
              </div>
              <div className="collapse-title-text-2">
                POIs die zu Beginn angezeigt werden
              </div>
            </div>
          </div>
        </div>
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
                    onChange={() => {
                      changeDefaultActiveGroups(group.title);
                    }}
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
                  onChange={(resultingPoiFilter) => {
                    changePoiFilter(resultingPoiFilter);
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
                        checked={!isGroupHidden(group)}
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
            {recentSnippetConfigs.length && (
              <li>
                <div className="flex items-center gap-6 py-1 w-full">
                  <h4 className="w-[6.5rem] font-bold">Vorlagen</h4>
                  <select
                    className="select select-bordered select-sm flex-1"
                    value={selectedSnippetConfigId}
                    disabled={recentSnippetConfigs.length === 1}
                    onChange={(e) => {
                      const changedSnippetConfigId = e.target.value;
                      setSelectedSnippetConfigId(changedSnippetConfigId);

                      onConfigChange({
                        ...recentSnippetConfigs.find(
                          ({ id }) => id === changedSnippetConfigId
                        )!.config,
                      });
                    }}
                  >
                    {recentSnippetConfigs.map((snippetConfig) => (
                      <option value={snippetConfig.id} key={snippetConfig.id}>
                        {snippetConfig.label}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            )}
            <li>
              <div className="flex items-center gap-6 py-1 w-full">
                <h4 className="w-[6.5rem] font-bold">Menu</h4>
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
              <div className="flex items-center gap-6 py-1 w-full">
                <h4 className="w-[6.5rem] font-bold">Karte</h4>
                <select
                  className="select select-bordered select-sm flex-1"
                  value={
                    config?.mapBoxMapId ||
                    "kudiba-tech/ckvu0ltho2j9214p847jp4t4m"
                  }
                  onChange={(event) => {
                    changeMapboxMap(event.target.value);
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
                <h4 className="w-[6.5rem] font-bold">Immobilienart</h4>
                <select
                  className="select select-bordered select-sm flex-1"
                  value={config?.realEstateStatus}
                  onChange={(event) => {
                    changeRealEstateStatusFilter(event.target.value);
                  }}
                >
                  {allRealEstateStatuses.map(({ label, status }) => (
                    <option value={status} key={`${status ? status : "alle"}`}>
                      {label}
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
              <IconSizes
                iconSizes={config?.iconSizes}
                onChange={(resultingIconSizes) => {
                  changeIconSizes(resultingIconSizes);
                }}
              />
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="showLocation"
                    checked={!!config?.showLocation}
                    onChange={() => {
                      changeShowLocation();
                    }}
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
                    onChange={() => {
                      changeShowAddress();
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
                      changeShowStreetViewLink();
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
                      changeGroupItems();
                    }}
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
                    onChange={() => {
                      changeFixedRealEstates();
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
                    checked={config?.hideIsochrones}
                    onChange={() => {
                      changeHideIsochrones();
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">Linien ausblenden</span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="hideIsochrones"
                    checked={config?.showDetailsInOnePage}
                    onChange={() => {
                      changeShowDetailsInOnePage();
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
                  onChange={(mapIcon) => {
                    changeMapIcon(mapIcon);
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
