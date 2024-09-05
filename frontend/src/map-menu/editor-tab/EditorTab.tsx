import { FC, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./EditorTab.scss";

import {
  EntityGroup,
  IEditorTabProps,
  ResultEntity,
} from "shared/search-result.types";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  IApiSnapshotConfigRealEstSettings,
  MeansOfTransportation,
  TPoiGroupName,
} from "../../../../shared/types/types";
import { LocalityItemContent } from "../components/menu-item/locality-item/LocalityItem";
import ColorPicker from "components/ColorPicker";
import ImageUpload from "components/ImageUpload";
import { setBackgroundColor } from "../../shared/shared.functions";
import { IApiRealEstStatusByUser } from "../../../../shared/types/real-estate";
import { realEstAllTextStatus } from "../../../../shared/constants/real-estate";
import configOptionsIcon from "../../assets/icons/map-menu/04-konfiguration.svg";
import poiVisibilityIcon from "../../assets/icons/map-menu/06-poi-sichtbarkeit.svg";
import {
  defaultMapboxStyles,
  MapboxStyleLabelsEnum,
  TMapboxStyleLabels,
} from "../../shared/shared.constants";
import PoiFilter from "./components/PoiFilter";
import IconSizes from "./components/IconSizes";
import { useLocationData } from "../../hooks/locationdata";
import { truncateText } from "../../../../shared/functions/shared.functions";
import { IApiLateSnapConfigOption } from "../../../../shared/types/location";
import { useRealEstateData } from "../../hooks/realestatedata";
import {
  checkIsEntityHidden,
  toggleEntityVisibility,
} from "../../shared/pois.functions";
import { SearchContext } from "../../context/SearchContext";
import { useUserState } from "../../hooks/userstate";

const EditorTab: FC<IEditorTabProps> = ({
  availableMeans = [],
  onConfigChange,
  snapshotId,
  extraMapboxStyles = [],
  isNewSnapshot = false,
}) => {
  const {
    searchContextState: {
      availGroupedEntities: groupedEntries = [],
      responseConfig,
    },
  } = useContext(SearchContext);

  const { t } = useTranslation();
  const { getActualUser } = useUserState();
  const { fetchLateSnapConfigs } = useLocationData();
  const { fetchRealEstStatuses } = useRealEstateData();

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;
  const config = responseConfig!;

  const [isConfigOptionsOpen, setIsConfigOptionsOpen] = useState(false);
  const [isPoiVisibilityOpen, setIsPoiVisibilityOpen] = useState(false);
  const [poiGroupsOpen, setPoiGroupsOpen] = useState<TPoiGroupName[]>([]);
  const [color, setColor] = useState(config.primaryColor);
  const [mapIcon, setMapIcon] = useState(config.mapIcon);
  const [lateSnapConfigs, setLateSnapConfigs] = useState<
    IApiLateSnapConfigOption[]
  >([]);
  const [selectedSnippetConfigId, setSelectedSnippetConfigId] = useState(
    t(IntlKeys.snapshotEditor.current).toLowerCase()
  );
  // Should not be simplified
  const [isReferenceMap, setIsReferenceMap] = useState<boolean>(
    !!(config.hideMeanToggles && config.hideMapMenu && config.hidePoiIcons)
  );
  const [realEstStatuses, setRealEstStatuses] =
    useState<IApiRealEstStatusByUser>({ status: [], status2: [] });

  useEffect(() => {
    if (!config.defaultActiveGroups && groupedEntries?.length) {
      onConfigChange({
        ...config,
        defaultActiveGroups: groupedEntries.map(({ name }) => name),
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
      label: `> ${t(IntlKeys.snapshotEditor.cardInYourBranding)} <`,
      isDisabled: true,
    },
    {
      key: "new-map-style-2",
      label: `> ${t(IntlKeys.snapshotEditor.talkToUs)} <`,
      isDisabled: true,
    },
  ];

  const changeConfigParam = <T,>(
    paramName: keyof ApiSearchResultSnapshotConfig,
    value: T
  ): void => {
    onConfigChange({ ...config, [paramName]: value });
  };

  const changeRealEstateSetting = (
    paramName: keyof IApiSnapshotConfigRealEstSettings,
    value: boolean | undefined
  ): void => {
    const newConfig = { ...config };

    if (!newConfig.realEstateSettings) {
      newConfig.realEstateSettings = {};
    }

    newConfig.realEstateSettings[paramName] = value;
    onConfigChange(newConfig);
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

  const checkIsGroupOpen = (group: EntityGroup): boolean =>
    poiGroupsOpen.includes(group.name);

  const toggleGroupOpen = (group: EntityGroup): void => {
    if (checkIsGroupOpen(group)) {
      setPoiGroupsOpen(
        poiGroupsOpen.filter((groupName) => groupName !== group.name)
      );
    } else {
      setPoiGroupsOpen([...poiGroupsOpen, group.name]);
    }
  };

  const checkIsGroupHidden = (group: EntityGroup): boolean =>
    !!config.hiddenGroups?.some((groupName) => groupName === group.name);

  const toggleGroupVisibility = (group: EntityGroup): void => {
    let hiddenGroups = config.hiddenGroups ? [...config.hiddenGroups] : [];

    if (checkIsGroupHidden(group)) {
      hiddenGroups = hiddenGroups.filter(
        (groupName) => groupName !== group.name
      );
    } else {
      hiddenGroups.push(group.name);
    }

    changeConfigParam("hiddenGroups", hiddenGroups);
  };

  const handleEntityVisibility = (entity: ResultEntity): void => {
    changeConfigParam(
      "entityVisibility",
      toggleEntityVisibility(entity, config)
    );
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

  const backgroundColor = config.primaryColor || "var(--primary-gradient)";

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
              <div className="collapse-title-text-1">
                {t(IntlKeys.snapshotEditor.POIDetailFilter)}
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
              .map((group) => (
                <li key={group.name}>
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
                        {group.title}
                      </h4>
                      <button
                        className="btn-sm btn-link"
                        onClick={() => {
                          toggleGroupOpen(group);
                        }}
                      >
                        {checkIsGroupOpen(group)
                          ? t(IntlKeys.common.close)
                          : t(IntlKeys.common.open)}
                      </button>
                    </div>
                    {checkIsGroupOpen(group) && (
                      <div className="group-items flex flex-col pl-2">
                        <ul>
                          {group.items.map((item) => (
                            <li key={item.id}>
                              <div className="item-title">
                                <input
                                  type="checkbox"
                                  checked={!checkIsEntityHidden(item, config)}
                                  className="checkbox checkbox-xs"
                                  onChange={() => {
                                    handleEntityVisibility(item);
                                  }}
                                />{" "}
                                <span>{item.name}</span>
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
              <div className="collapse-title-text-1">
                {t(IntlKeys.snapshotEditor.configuration)}
              </div>
            </div>
          </div>
        </div>
        <div className="collapse-content">
          <ul className="editor-configuration-list">
            {lateSnapConfigs.length > 0 && (
              <li>
                <div className="flex items-center gap-6 py-1 w-full">
                  <h4 className="w-[6.5rem] font-bold">
                    {t(IntlKeys.snapshotEditor.templates)}
                  </h4>
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
                <h4 className="w-[6.5rem] font-bold">
                  {t(IntlKeys.snapshotEditor.cardStyle)}
                </h4>
                <select
                  className="select select-bordered select-sm flex-1 w-full"
                  value={
                    config.mapBoxMapId ||
                    defaultMapboxStyles.find(
                      ({ label }) => label === MapboxStyleLabelsEnum.CLASSIC
                    )?.key
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
                <h4 className="w-[6.5rem] font-bold">
                  {t(IntlKeys.common.marketingType)}
                </h4>
                <select
                  className="select select-bordered select-sm flex-1 w-full"
                  value={config.realEstateStatus || realEstAllTextStatus}
                  onChange={(event) => {
                    changeConfigParam(
                      "realEstateStatus",
                      event.target.value !== realEstAllTextStatus
                        ? event.target.value
                        : undefined
                    );
                  }}
                >
                  {/*
                  // TODO: change BE for translations
                  */}
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
                <h4 className="w-[6.5rem] font-bold">
                  {t(IntlKeys.common.status)}
                </h4>
                <select
                  className="select select-bordered select-sm flex-1 w-full"
                  value={config.realEstateStatus2 || realEstAllTextStatus}
                  onChange={(event) => {
                    changeConfigParam(
                      "realEstateStatus2",
                      event.target.value !== realEstAllTextStatus
                        ? event.target.value
                        : undefined
                    );
                  }}
                >
                  {/*
                  // TODO: change BE for translations
                  */}
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
                <h4 className="w-[6.5rem] font-bold">
                  {t(IntlKeys.snapshotEditor.menuStyle)}
                </h4>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="theme"
                    checked={!config.theme || config.theme === "DEFAULT"}
                    onChange={() => {
                      changeTheme("DEFAULT");
                    }}
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.standard)}
                  </span>
                </label>
                <label className="cursor-pointer label">
                  <input
                    type="radio"
                    name="theme"
                    checked={config.theme === "KF"}
                    onChange={() => {
                      changeTheme("KF");
                    }}
                    className="radio radio-sm radio-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.minimal)}
                  </span>
                </label>
              </div>
            </li>
            <li>
              <IconSizes
                iconSizes={config.iconSizes}
                onChange={(resultingIconSizes) => {
                  changeConfigParam("iconSizes", { ...resultingIconSizes });
                }}
              />
            </li>
            <li>
              <div className="flex flex-col">
                <h4 className="font-bold">
                  {t(IntlKeys.snapshotEditor.preselectedProfile)}
                </h4>
                <div className="flex items-center gap-6 py-1">
                  {availableMeans.includes(MeansOfTransportation.WALK) && (
                    <label className="cursor-pointer label">
                      <input
                        type="checkbox"
                        name="defaultActiveMeansWalk"
                        checked={
                          !config.defaultActiveMeans ||
                          config.defaultActiveMeans.includes(
                            MeansOfTransportation.WALK
                          )
                        }
                        onChange={() => {
                          changeDefaultActiveMeans(MeansOfTransportation.WALK);
                        }}
                        className="checkbox checkbox-xs checkbox-primary mr-2"
                      />
                      <span className="label-text">
                        {t(IntlKeys.common.transportationTypes.walking)}
                      </span>
                    </label>
                  )}
                  {availableMeans.includes(MeansOfTransportation.BICYCLE) && (
                    <label className="cursor-pointer label">
                      <input
                        type="checkbox"
                        name="defaultActiveMeansBike"
                        checked={
                          !config.defaultActiveMeans ||
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
                      <span className="label-text">
                        {t(IntlKeys.common.transportationTypes.cycling)}
                      </span>
                    </label>
                  )}
                  {availableMeans.includes(MeansOfTransportation.CAR) && (
                    <label className="cursor-pointer label">
                      <input
                        type="checkbox"
                        name="defaultActiveMeansCar"
                        checked={
                          !config.defaultActiveMeans ||
                          config.defaultActiveMeans.includes(
                            MeansOfTransportation.CAR
                          )
                        }
                        onChange={() => {
                          changeDefaultActiveMeans(MeansOfTransportation.CAR);
                        }}
                        className="checkbox checkbox-xs checkbox-primary mr-2"
                      />
                      <span className="label-text">
                        {t(IntlKeys.common.transportationTypes.driving)}
                      </span>
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
                    checked={!!config.showLocation}
                    onChange={() => {
                      changeConfigParam("showLocation", !config.showLocation);
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.showIcon)}
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="showAddress"
                    checked={!!config.showAddress}
                    onChange={() => {
                      changeConfigParam("showAddress", !config.showAddress);
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.showAddress)}
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="showStreetViewLink"
                    checked={!!config.showStreetViewLink}
                    onChange={() => {
                      changeConfigParam(
                        "showStreetViewLink",
                        !config.showStreetViewLink
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.showStreetViewLink)}
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="groupItems"
                    checked={!!config.groupItems}
                    onChange={() => {
                      changeConfigParam("groupItems", !config.groupItems);
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.groupPOIOnZoom)}
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
                    checked={!!config.hideIsochrones}
                    onChange={() => {
                      changeConfigParam(
                        "hideIsochrones",
                        !config.hideIsochrones
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.hideIsochrones)}
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="isDetailsShown"
                    checked={!!config.isDetailsShown}
                    onChange={() => {
                      changeConfigParam(
                        "isDetailsShown",
                        !config.isDetailsShown
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.objectInfoDisplayed)}
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
                    checked={!!config.isMapMenuCollapsed}
                    onChange={() => {
                      changeConfigParam(
                        "isMapMenuCollapsed",
                        !config.isMapMenuCollapsed
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.minimizeOnIframe)}
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
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.referenceCard)}
                  </span>
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
                          checked={!!config.isFilterMenuAvail}
                          onChange={() => {
                            changeConfigParam(
                              "isFilterMenuAvail",
                              !config.isFilterMenuAvail
                            );
                          }}
                          className="checkbox checkbox-xs checkbox-primary mr-2"
                        />
                        <span className="label-text">
                          {t(IntlKeys.snapshotEditor.needsFilterForRealEstate)}
                        </span>
                      </label>
                    </div>
                  </li>
                )}

            <li>
              <div className="flex-col items-baseline">
                <div className="flex items-center gap-6 py-1">
                  <ColorPicker
                    label={t(IntlKeys.snapshotEditor.primaryColor)}
                    color={color}
                    setColor={setColor}
                    onChange={(color) => {
                      changeColor(color);
                    }}
                  />
                  {config.primaryColor && (
                    <button
                      className="text-sm"
                      onClick={() => {
                        changeColor(undefined);
                      }}
                    >
                      {t(IntlKeys.snapshotEditor.resetColor)}
                    </button>
                  )}
                </div>
                <label className="cursor-pointer label justify-start">
                  <input
                    type="checkbox"
                    name="isInvertBaseColor"
                    checked={config.isInvertBaseColor}
                    onChange={() => {
                      changeConfigParam(
                        "isInvertBaseColor",
                        !config.isInvertBaseColor
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.invertBaseColor)}
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <ImageUpload
                  label={t(IntlKeys.snapshotEditor.cardsIcon)}
                  uploadLabel={t(IntlKeys.snapshotEditor.uploadIcon)}
                  inputId="map-icon-upload-button"
                  image={mapIcon}
                  setImage={setMapIcon}
                  onChange={(newMapIcon) => {
                    changeMapIcon(newMapIcon);
                  }}
                />
                {config.mapIcon && (
                  <button
                    className="text-sm"
                    onClick={() => {
                      changeMapIcon(undefined);
                    }}
                  >
                    {t(IntlKeys.snapshotEditor.resetIcon)}
                  </button>
                )}
              </div>
            </li>
            <li className="font-bold">
              {t(IntlKeys.snapshotEditor.objectTooltip)}
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="isCostStructureHidden"
                    checked={!!config.realEstateSettings?.isCostStructureHidden}
                    onChange={() => {
                      changeRealEstateSetting(
                        "isCostStructureHidden",
                        !config.realEstateSettings?.isCostStructureHidden
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.hideCost)}
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="isTypeShown"
                    checked={!!config.realEstateSettings?.isTypeShown}
                    onChange={() => {
                      changeRealEstateSetting(
                        "isTypeShown",
                        !config.realEstateSettings?.isTypeShown
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.showObjectType)}
                  </span>
                </label>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-6 py-1">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    name="isCharacteristicsHidden"
                    checked={
                      !!config.realEstateSettings?.isCharacteristicsHidden
                    }
                    onChange={() => {
                      changeRealEstateSetting(
                        "isCharacteristicsHidden",
                        !config.realEstateSettings?.isCharacteristicsHidden
                      );
                    }}
                    className="checkbox checkbox-xs checkbox-primary mr-2"
                  />
                  <span className="label-text">
                    {t(IntlKeys.snapshotEditor.hideOtherPropertyFeatures)}
                  </span>
                </label>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditorTab;
