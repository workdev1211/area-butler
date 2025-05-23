import { v4 } from "uuid";

import i18 from "i18n";
import { IntlKeys } from "i18n/keys";

import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiOsmEntityCategory,
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  ApiSnippetEntityVisibility,
  IApiSnapshotPoiFilter,
  MeansOfTransportation,
  OsmName,
  PoiFilterTypesEnum,
  TPoiGroupName,
} from "../../../shared/types/types";
import { EntityGroup, ResultEntity } from "./search-result.types";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import { distanceInMeters } from "./shared.functions";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import {
  LocIndexPropsEnum,
  TApiLocIndexProps,
} from "../../../shared/types/location-index";
import { OsmEntityMapper } from "../../../shared/types/osm-entity-mapper";

interface IDeriveParameters {
  searchResponse: ApiSearchResponse;
  config?: ApiSearchResultSnapshotConfig;
  ignorePoiFilter?: boolean;
  ignoreVisibility?: boolean;
  preferredLocations?: ApiPreferredLocation[];
  realEstates?: ApiRealEstateListing[];
}

// TODO refactor to a poi hook

const osmEntityMapper = new OsmEntityMapper();

const checkIsLocationHidden = (
  entity: Pick<ApiOsmEntity, "id" | "name">,
  config?: ApiSearchResultSnapshotConfig,
  ignoreVisibility?: boolean
): boolean => {
  const isVisibilityAccounted =
    !ignoreVisibility &&
    !!(config?.entityVisibility?.length || config?.hiddenGroups?.length);

  if (!isVisibilityAccounted) {
    return false;
  }

  let isLocationHidden = false;

  if (entity.id && config?.entityVisibility) {
    isLocationHidden = config.entityVisibility.some(
      (ev) => ev.id === entity.id && ev.excluded
    );
  }

  if (!isLocationHidden && config?.hiddenGroups) {
    isLocationHidden = config.hiddenGroups.some(
      (groupName) =>
        groupName === osmEntityMapper.getGrpNameByOsmName(entity.name)
    );
  }

  return isLocationHidden;
};

export const convertLocationToResEntity = (
  location: ApiOsmLocation
): ResultEntity => {
  const locationEntity = location.entity;

  if (!locationEntity.id) {
    throw new Error("Entity id is missing!");
  }

  return {
    id: locationEntity.id,
    name: locationEntity.title,
    osmName: Object.values(OsmName).includes(
      locationEntity.type as unknown as OsmName
    )
      ? (locationEntity.type as unknown as OsmName)
      : locationEntity.name,
    distanceInMeters: location.distanceInMeters,
    coordinates: location.coordinates,
    address: location.address,
    byFoot: false,
    byBike: false,
    byCar: false,
    selected: false,
  };
};

export const setTransportParamForResEntity = (
  resultEntity: ResultEntity,
  transportParam: MeansOfTransportation
): void => {
  switch (transportParam) {
    case MeansOfTransportation.WALK: {
      resultEntity.byFoot = true;
      break;
    }

    case MeansOfTransportation.BICYCLE: {
      resultEntity.byBike = true;
      break;
    }

    case MeansOfTransportation.CAR: {
      resultEntity.byCar = true;
      break;
    }
  }
};

const buildEntityData = (
  locationSearchResult: ApiSearchResponse,
  config?: ApiSearchResultSnapshotConfig,
  ignoreVisibility?: boolean
): ResultEntity[] => {
  if (!locationSearchResult) {
    return [];
  }

  const allLocations = new Map<string, ResultEntity>();

  Object.keys(locationSearchResult.routingProfiles).forEach(
    (transportParam) => {
      const { locationsOfInterest: locations } =
        locationSearchResult.routingProfiles[
          transportParam as MeansOfTransportation
        ];

      locations.forEach((location) => {
        const entity = location.entity;

        if (!entity.id) {
          return;
        }

        if (checkIsLocationHidden(entity, config, ignoreVisibility)) {
          return;
        }

        const resultEntity: ResultEntity =
          allLocations.get(entity.id) || convertLocationToResEntity(location);

        setTransportParamForResEntity(
          resultEntity,
          transportParam as MeansOfTransportation
        );

        allLocations.set(entity.id, resultEntity);
      });
    }
  );

  return Array.from(allLocations.values());
};

const buildEntDataFromPrefLocs = ({
  centerOfSearch,
  preferredLocations,
  config,
  ignoreVisibility,
}: {
  centerOfSearch: ApiCoordinates;
  preferredLocations: ApiPreferredLocation[];
  config?: ApiSearchResultSnapshotConfig;
  ignoreVisibility?: boolean;
}): ResultEntity[] => {
  // 'ignoreVisibility' doesn't work properly here because the preferred locations don't have the ids
  return preferredLocations.reduce<ResultEntity[]>(
    (result, { address, coordinates, title }) => {
      if (
        !coordinates ||
        checkIsLocationHidden(
          { name: OsmName.favorite },
          config,
          ignoreVisibility
        )
      ) {
        return result;
      }

      result.push({
        id: v4(),
        name: `${title} (${address})`,
        osmName: OsmName.favorite,
        distanceInMeters: distanceInMeters(centerOfSearch, coordinates), // Calc distance
        coordinates: coordinates,
        address: { street: address },
        byFoot: true,
        byBike: true,
        byCar: true,
        selected: false,
      });

      return result;
    },
    []
  );
};

const buildEntDataFromEstates = ({
  centerOfSearch,
  config,
  ignoreVisibility,
  realEstates,
}: {
  centerOfSearch: ApiCoordinates;
  realEstates: ApiRealEstateListing[];
  config?: ApiSearchResultSnapshotConfig;
  ignoreVisibility?: boolean;
}): ResultEntity[] => {
  return realEstates.reduce<ResultEntity[]>((result, realEstate) => {
    const entityId = realEstate.id;

    if (
      !realEstate.coordinates ||
      checkIsLocationHidden(
        { id: entityId, name: OsmName.property },
        config,
        ignoreVisibility
      )
    ) {
      return result;
    }

    const locationIndices = realEstate.locationIndices
      ? Object.keys(realEstate.locationIndices).reduce<TApiLocIndexProps>(
          (result, locationIndex) => {
            result[locationIndex as LocIndexPropsEnum] =
              realEstate.locationIndices![
                locationIndex as LocIndexPropsEnum
              ]?.value;

            return result;
          },
          {} as TApiLocIndexProps
        )
      : undefined;

    result.push({
      id: entityId ?? v4(),
      name: realEstate.name,
      osmName: OsmName.property,
      distanceInMeters: distanceInMeters(
        centerOfSearch,
        realEstate.coordinates!
      ), // Calc distance
      realEstateData: {
        locationIndices,
        characteristics: realEstate.characteristics,
        costStructure: realEstate.costStructure,
        type: realEstate.type,
      },
      coordinates: realEstate.coordinates!,
      address: config?.showLocation
        ? { street: realEstate.address }
        : { street: undefined },
      byFoot: true,
      byBike: true,
      byCar: true,
      selected: false,
      externalUrl: realEstate.externalUrl,
    });

    return result;
  }, []);
};

const applyPoiFilter = (
  entityGroups: EntityGroup[],
  poiFilter: IApiSnapshotPoiFilter
): EntityGroup[] => {
  if (poiFilter.type === PoiFilterTypesEnum.NONE) {
    return entityGroups;
  }

  let filterItems: (items: ResultEntity[]) => ResultEntity[];

  switch (poiFilter.type) {
    case PoiFilterTypesEnum.BY_AMOUNT: {
      filterItems = (items: ResultEntity[]) => items.slice(0, poiFilter.value!);
      break;
    }

    case PoiFilterTypesEnum.BY_DISTANCE: {
      filterItems = (items: ResultEntity[]) =>
        items.reduce<ResultEntity[]>((result, item) => {
          if (poiFilter.value! >= item.distanceInMeters) {
            result.push(item);
          }

          return result;
        }, []);
      break;
    }
  }

  return entityGroups.reduce<EntityGroup[]>((result, { items, ...group }) => {
    const groupItems = filterItems(items);

    if (groupItems.length) {
      (group as EntityGroup).items = groupItems;
      result.push(group as EntityGroup);
    }

    return result;
  }, []);
};

export const deriveInitialEntityGroups = ({
  config,
  ignorePoiFilter,
  preferredLocations,
  realEstates,
  searchResponse,
  ignoreVisibility = false,
}: IDeriveParameters): EntityGroup[] => {
  const deriveActiveState = (
    groupName: TPoiGroupName,
    index?: number
  ): boolean => {
    const activeGroups = config?.defaultActiveGroups ?? [];

    if (activeGroups.length) {
      return activeGroups.includes(groupName);
    }

    // For the 'KF' theme only a single category should be active if it's not defined in 'defaultActiveGroups'
    return config?.theme === "KF" ? index === 0 : true;
  };

  const entityGroups: EntityGroup[] = [];
  const centerOfSearch = searchResponse?.centerOfInterest?.coordinates;

  if (centerOfSearch && preferredLocations?.length) {
    entityGroups.push({
      active: deriveActiveState(OsmName.favorite),
      items: buildEntDataFromPrefLocs({
        centerOfSearch,
        config,
        ignoreVisibility,
        preferredLocations,
      }),
      name: OsmName.favorite,
      title: i18.t(IntlKeys.potentialCustomers.importantAddresses),
    });
  }

  if (centerOfSearch && realEstates?.length) {
    entityGroups.push({
      active: deriveActiveState(OsmName.property),
      items: buildEntDataFromEstates({
        centerOfSearch,
        config,
        ignoreVisibility,
        realEstates,
      }),
      name: OsmName.property,
      title: i18.t(IntlKeys.snapshotEditor.furtherObjects),
    });
  }

  const poiItems = buildEntityData(
    searchResponse,
    config,
    ignoreVisibility
  ).sort(
    (
      { distanceInMeters: distanceInMeters1 },
      { distanceInMeters: distanceInMeters2 }
    ) => distanceInMeters1 - distanceInMeters2
  );

  const poiGroups = Object.values(
    poiItems.reduce<Record<string, EntityGroup>>((result, resultEntity) => {
      const groupName = osmEntityMapper.getGrpNameByOsmName(
        resultEntity.osmName
      );

      if (!groupName) {
        return result;
      }

      if (result[groupName]) {
        const groupItems = result[groupName].items;
        groupItems.push(resultEntity);
      }

      if (!result[groupName]) {
        result[groupName] = {
          active: deriveActiveState(groupName, Object.keys(result).length),
          items: [resultEntity],
          name: groupName,
          title: i18.t(
            (
              IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>
            )[groupName]
          ),
        };
      }

      return result;
    }, {})
  );

  entityGroups.push(
    ...(!ignorePoiFilter && config?.poiFilter?.value
      ? applyPoiFilter(poiGroups, config.poiFilter)
      : poiGroups)
  );

  return entityGroups.sort((a, b) => a.title.localeCompare(b.title));
};

export const derivePoiGroupsByActMeans = (
  entityGroups: EntityGroup[] = [],
  activeMeans: MeansOfTransportation[] = []
): EntityGroup[] => {
  const filterByMeans = (
    entityGroup: EntityGroup,
    activeMeans: MeansOfTransportation[]
  ): EntityGroup => {
    return {
      ...entityGroup,
      items: entityGroup.items.filter(
        (i) =>
          (activeMeans.includes(MeansOfTransportation.WALK) && i.byFoot) ||
          (activeMeans.includes(MeansOfTransportation.BICYCLE) && i.byBike) ||
          (activeMeans.includes(MeansOfTransportation.CAR) && i.byCar)
      ),
    };
  };

  return entityGroups.map((group) => filterByMeans(group, activeMeans));
};

export const checkIsEntityHidden = (
  entity: ResultEntity,
  config: ApiSearchResultSnapshotConfig
): boolean =>
  !config.entityVisibility
    ? false
    : config.entityVisibility.some((ev) => ev.id === entity.id && ev.excluded);

export const toggleEntityVisibility = (
  entity: ResultEntity,
  config: ApiSearchResultSnapshotConfig
): ApiSnippetEntityVisibility[] => {
  const entityVisibility = [...(config.entityVisibility || [])];
  const foundEntity = entityVisibility.find((ev) => ev.id === entity.id);

  if (foundEntity) {
    foundEntity.excluded = !foundEntity.excluded;
  } else {
    entityVisibility.push({
      id: entity.id,
      excluded: true,
    });
  }

  return entityVisibility;
};

export const getOsmCategories = (): Array<{
  category: ApiOsmEntityCategory;
  title: string;
}> =>
  Object.values(ApiOsmEntityCategory)
    .map((category) => ({
      category,
      title: i18.t(IntlKeys.snapshotEditor.pointsOfInterest[category]),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
