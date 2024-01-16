import {
  geocodeByAddress,
  geocodeByLatLng,
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";
import harversine from "haversine";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import copy from "copy-to-clipboard";
import { LatLng } from "react-google-places-autocomplete/build/GooglePlacesAutocomplete.types";

import {
  ApiCoordinates,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  ApiUser,
  IApiUserPoiIcon,
  MeansOfTransportation,
  OsmName,
  PoiFilterTypesEnum,
} from "../../../shared/types/types";
import parkIcon from "../assets/icons/pois/park.svg";
import fuelIcon from "../assets/icons/pois/fuel.svg";
import chemistIcon from "../assets/icons/pois/chemist.svg";
import stationIcon from "../assets/icons/pois/station.svg";
import barIcon from "../assets/icons/pois/bar.svg";
import busStopIcon from "../assets/icons/pois/bus_stop.svg";
import restaurantIcon from "../assets/icons/pois/restaurant.svg";
import theatreIcon from "../assets/icons/pois/theatre.svg";
import playgroundIcon from "../assets/icons/pois/playground.svg";
import kindergartenIcon from "../assets/icons/pois/kindergarten.svg";
import schoolIcon from "../assets/icons/pois/school.svg";
import universityIcon from "../assets/icons/pois/university.svg";
import doctorsIcon from "../assets/icons/pois/doctors.svg";
import clinicIcon from "../assets/icons/pois/hospital.svg";
import motorwayLinkIcon from "../assets/icons/pois/motorway_link.svg";
import sportIcon from "../assets/icons/pois/sport.svg";
import kioskIcon from "../assets/icons/pois/kiosk.svg";
import hotelIcon from "../assets/icons/pois/hotel.svg";
import towerIcon from "../assets/icons/pois/tower.svg";
import parkingIcon from "../assets/icons/pois/parking.svg";
import parkingGarageIcon from "../assets/icons/pois/parking-garage.svg";
import attractionIcon from "../assets/icons/pois/attraction.svg";
import chargingStationIcon from "../assets/icons/pois/charging_station.svg";
import museumIcon from "../assets/icons/pois/museum.svg";
import pharmacyIcon from "../assets/icons/pois/pharmacy.svg";
import windTurbineIcon from "../assets/icons/pois/wind_turbine.svg";
import preferredLocationIcon from "../assets/icons/icons-24-x-24-illustrated-ic-starred.svg";
import realEstateListingIcon from "../assets/icons/icons-20-x-20-outline-ic-ab.svg";
import {
  meansOfTransportations,
  osmEntityTypes,
} from "../../../shared/constants/constants";
import { EntityGroup, ResultEntity } from "./search-result.types";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { IPoiIcon, IQueryParamsAndUrl } from "./shared.types";
import {
  LocIndexPropsEnum,
  TApiLocIndexProps,
} from "../../../shared/types/location-index";
import { realEstateListingsTitle } from "../../../shared/constants/real-estate";

const tinyColor = require("tinycolor2");

export interface IColorPalette {
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  textColor: string;
}

interface IDeriveParameters {
  searchResponse: ApiSearchResponse;
  config?: ApiSearchResultSnapshotConfig;
  listings?: ApiRealEstateListing[];
  locations?: ApiPreferredLocation[];
  ignoreVisibility?: boolean;
  ignorePoiFilter?: boolean;
}

export const dateDiffInDays = (d1: Date, d2: Date = new Date()): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  d1.setHours(0, 0, 0);
  d2.setHours(0, 0, 0);

  return Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
};

export const deriveGeocodeByAddress = async (
  address: string
): Promise<LatLng> => {
  const latlngResults = await geocodeByAddress(address);
  return await getLatLng(latlngResults[0]);
};

export const deriveGeocodeByPlaceId = async (
  placeId: string
): Promise<LatLng> => {
  const latlngResults = await geocodeByPlaceId(placeId);
  return getLatLng(latlngResults[0]);
};

export const deriveAddressFromCoordinates = async (
  coordinates: ApiCoordinates
): Promise<{ label: string; value: { place_id: string } } | null> => {
  const places = await geocodeByLatLng(coordinates);

  if (!(places && places.length > 0)) {
    return null;
  }

  const { formatted_address, place_id } = places[0];

  return {
    label: formatted_address,
    value: {
      place_id,
    },
  };
};

export const distanceInMeters = (from: ApiCoordinates, to: ApiCoordinates) => {
  return harversine(
    {
      latitude: from.lat,
      longitude: from.lng,
    },
    {
      latitude: to.lat,
      longitude: to.lng,
    },
    { unit: "meter" }
  );
};

export const entityIncludesMean = (
  entity: ResultEntity,
  means: MeansOfTransportation[]
) => {
  return (
    (entity.byCar && means.includes(MeansOfTransportation.CAR)) ||
    (entity.byBike && means.includes(MeansOfTransportation.BICYCLE)) ||
    (entity.byFoot && means.includes(MeansOfTransportation.WALK))
  );
};

export const distanceToHumanReadable = (distanceInMeters: number): string => {
  if (distanceInMeters < 1000) {
    return `${Math.floor(distanceInMeters)}m`;
  }

  if (distanceInMeters % 1000 === 0) {
    return `${Math.floor(distanceInMeters / 1000)}km`;
  } else {
    return `${Math.floor(distanceInMeters / 1000)}.${Math.ceil(
      (distanceInMeters % 1000) / 100
    )}km`;
  }
};

export const timeToHumanReadable = (timeInMinutes: number): string => {
  if (timeInMinutes < 60) {
    return `${Math.floor(timeInMinutes)} Min.`;
  }

  if (timeInMinutes % 60 === 0) {
    return `${Math.floor(timeInMinutes / 60)} Std.`;
  } else {
    return `${Math.floor(timeInMinutes / 60)} Std. ${Math.floor(
      timeInMinutes % 60
    )} Min.`;
  }
};

export const toastSuccess = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 10000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const toastError = (
  message: string,
  onClose = () => {},
  closeTimeMs: number | false = 10000
) => {
  toast.error(message, {
    onClose,
    position: "top-right",
    autoClose: closeTimeMs,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const toastDefaultError = (): void => {
  toastError("Ein Fehler ist aufgetreten!");
};

// TODO think about uniting "getRealEstateListingsIcon", "getPreferredLocationsIcon" and "deriveIconForOsmName" into a single method
export const preferredLocationsTitle = "Wichtige Adressen";
export const getPreferredLocationsIcon = (
  userPoiIcons?: IApiUserPoiIcon[]
): IPoiIcon => {
  const customIcon = userPoiIcons?.find(
    ({ name }) => name === OsmName.favorite
  )?.file;

  return customIcon
    ? { icon: customIcon, color: "transparent", isCustom: true }
    : { icon: preferredLocationIcon, color: "#c91444" };
};

export const getRealEstateListingsIcon = (
  userPoiIcons?: IApiUserPoiIcon[]
): IPoiIcon => {
  const customIcon = userPoiIcons?.find(
    ({ name }) => name === OsmName.property
  )?.file;

  return customIcon
    ? { icon: customIcon, color: "transparent", isCustom: true }
    : { icon: realEstateListingIcon, color: "#c91444" };
};

export const deriveColorPalette = (hexColor: string): IColorPalette => {
  const hexColorTinyColor = new tinyColor(hexColor);

  return {
    primaryColor: hexColor,
    primaryColorLight: hexColorTinyColor
      .desaturate(30)
      .lighten(10)
      .toHexString(),
    primaryColorDark: hexColorTinyColor.saturate(30).darken(10).toHexString(),
    textColor: hexColorTinyColor.isDark() ? "#FFFFFF" : "#000000",
  };
};

export const deriveIconForOsmName = (
  osmName: OsmName,
  userPoiIcons?: IApiUserPoiIcon[]
): IPoiIcon => {
  const customIcon = userPoiIcons?.find(({ name }) => name === osmName)?.file;

  if (customIcon) {
    return { icon: customIcon, color: "transparent", isCustom: true };
  }

  switch (osmName) {
    case OsmName.fuel:
      return {
        icon: fuelIcon,
        color: "#8E71EB",
      };
    case OsmName.chemist:
    case OsmName.supermarket:
      return {
        icon: chemistIcon,
        color: "#267F9D",
      };
    case OsmName.kiosk:
    case OsmName.post_office:
      return {
        icon: kioskIcon,
        color: "#8F72EB",
      };
    case OsmName.station:
      return {
        icon: stationIcon,
        color: "#267F9D",
      };
    case OsmName.bus_stop:
      return {
        icon: busStopIcon,
        color: "#C71362",
      };
    case OsmName.bar:
    case OsmName.pub:
      return {
        icon: barIcon,
        color: "#E3BB3F",
      };
    case OsmName.restaurant:
      return {
        icon: restaurantIcon,
        color: "#48136D",
      };
    case OsmName.theatre:
      return {
        icon: theatreIcon,
        color: "#C91444",
      };
    case OsmName.playground:
      return {
        icon: playgroundIcon,
        color: "#D96666",
      };
    case OsmName.kindergarten:
      return {
        icon: kindergartenIcon,
        color: "#734242",
      };
    case OsmName.school:
      return {
        icon: schoolIcon,
        color: "#96476A",
      };
    case OsmName.university:
      return {
        icon: universityIcon,
        color: "#201C1E",
      };
    case OsmName.doctors:
    case OsmName.dentist:
      return {
        icon: doctorsIcon,
        color: "#10A877",
      };
    case OsmName.clinic:
    case OsmName.hospital:
      return {
        icon: clinicIcon,
        color: "#42AEA7",
      };
    case OsmName.motorway_link:
      return {
        icon: motorwayLinkIcon,
        color: "#579BE4",
      };
    case OsmName.sports_centre:
    case OsmName.sports_hall:
    case OsmName.swimming_pool:
    case OsmName.fitness_centre:
      return {
        icon: sportIcon,
        color: "#9F532E",
      };
    case OsmName.hotel:
      return {
        icon: hotelIcon,
        color: "#E4BC40",
      };
    case OsmName.tower:
    case OsmName.pole:
      return {
        icon: towerIcon,
        color: "#165B4E",
      };
    case OsmName["multi-storey"]:
    case OsmName.underground:
      return {
        icon: parkingGarageIcon,
        color: "#6563FF",
      };
    case OsmName.surface:
      return {
        icon: parkingIcon,
        color: "#6563FF",
      };
    case OsmName.attraction:
      return {
        icon: attractionIcon,
        color: "#640D24",
      };
    case OsmName.charging_station:
      return {
        icon: chargingStationIcon,
        color: "#579BE4",
      };
    case OsmName.museum:
      return {
        icon: museumIcon,
        color: "#C91444",
      };
    case OsmName.pharmacy:
      return {
        icon: pharmacyIcon,
        color: "#9F532E",
      };
    case OsmName.wind_turbine:
      return {
        icon: windTurbineIcon,
        color: "#1A5A6B",
      };
    case OsmName.park:
    default:
      return {
        icon: parkIcon,
        color: "#165B4E",
      };
  }
};

export const deriveTotalRequestContingent = (user: ApiUser) =>
  user?.requestContingents?.length > 0
    ? user.requestContingents
        .map((c) => c.amount)
        .reduce((acc, inc) => acc + inc)
    : 0;

export const deriveAvailableMeansFromResponse = (
  searchResponse?: ApiSearchResponse
): MeansOfTransportation[] => {
  const routingKeys = Object.keys(searchResponse?.routingProfiles || []);

  return meansOfTransportations
    .filter((mot) => routingKeys.includes(mot.type))
    .map((mot) => mot.type);
};

export const buildEntityData = (
  locationSearchResult: ApiSearchResponse,
  config?: ApiSearchResultSnapshotConfig,
  ignoreVisibility?: boolean,
  ignorePoiFilter?: boolean
): ResultEntity[] | undefined => {
  if (!locationSearchResult) {
    return;
  }

  const allLocations = Object.values(
    locationSearchResult.routingProfiles
  ).flatMap(({ locationsOfInterest }) => [...locationsOfInterest]);

  let allLocationIds = Array.from(
    new Set(allLocations.map((location) => location.entity.id))
  );

  if (config && config.entityVisibility && !ignoreVisibility) {
    const { entityVisibility = [] } = config;

    allLocationIds = allLocationIds.filter(
      (id) => !entityVisibility.some((ev) => ev.id === id && ev.excluded)
    );
  }

  return allLocationIds.reduce<ResultEntity[]>((result, locationId) => {
    const location = allLocations.find((l) => l.entity.id === locationId)!;

    // POI Filter by distance
    if (
      !ignorePoiFilter &&
      config?.poiFilter?.type === PoiFilterTypesEnum.BY_DISTANCE &&
      config?.poiFilter?.value! < location.distanceInMeters
    ) {
      return result;
    }

    result.push({
      id: locationId!,
      name: location.entity.title,
      label: location.entity.label,
      osmName: Object.values(OsmName).includes(
        location.entity.type as unknown as OsmName
      )
        ? (location.entity.type as unknown as OsmName)
        : location.entity.name,
      distanceInMeters: location.distanceInMeters,
      coordinates: location.coordinates,
      address: location.address,
      byFoot:
        locationSearchResult!.routingProfiles.WALK?.locationsOfInterest?.some(
          (l) => l.entity.id === locationId
        ) ?? false,
      byBike:
        locationSearchResult!.routingProfiles.BICYCLE?.locationsOfInterest?.some(
          (l) => l.entity.id === locationId
        ) ?? false,
      byCar:
        locationSearchResult!.routingProfiles.CAR?.locationsOfInterest?.some(
          (l) => l.entity.id === locationId
        ) ?? false,
      selected: false,
    });

    return result;
  }, []);
};

export const buildEntityDataFromPreferredLocations = (
  centerCoordinates: ApiCoordinates,
  preferredLocations: ApiPreferredLocation[]
): ResultEntity[] => {
  return preferredLocations
    .filter((preferredLocation) => !!preferredLocation.coordinates)
    .map((preferredLocation) => ({
      id: v4(),
      name: `${preferredLocation.title} (${preferredLocation.address})`,
      label: preferredLocationsTitle,
      osmName: OsmName.favorite,
      distanceInMeters: distanceInMeters(
        centerCoordinates,
        preferredLocation.coordinates!
      ), // Calc distance
      coordinates: preferredLocation.coordinates!,
      address: { street: preferredLocation.address },
      byFoot: true,
      byBike: true,
      byCar: true,
      selected: false,
    }));
};

export const buildEntDataFromRealEstates = ({
  centerOfSearch,
  realEstates,
  config,
  ignoreVisibility,
}: {
  centerOfSearch: ApiCoordinates;
  realEstates: ApiRealEstateListing[];
  config?: ApiSearchResultSnapshotConfig;
  ignoreVisibility?: boolean;
}): ResultEntity[] => {
  const deriveName = (realEstateListing: ApiRealEstateListing) => {
    const showLocation = config?.showLocation ?? false;

    // TODO check this
    if (!showLocation) {
      return `${realEstateListing.name}`;
    } else {
      return `${realEstateListing.name}`;
    }
  };

  const mappedRealEstates = realEstates.reduce<ResultEntity[]>(
    (result, realEstate) => {
      if (!realEstate.coordinates) {
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
        id: realEstate.id ?? v4(),
        name: deriveName(realEstate),
        label: realEstateListingsTitle,
        osmName: OsmName.property,
        distanceInMeters: distanceInMeters(
          centerOfSearch,
          realEstate.coordinates!
        ), // Calc distance
        realEstateData: {
          locationIndices,
          costStructure: realEstate.costStructure,
          characteristics: realEstate.characteristics,
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
    },
    []
  );

  if (config?.entityVisibility && !ignoreVisibility) {
    const { entityVisibility = [] } = config;

    return mappedRealEstates.filter(
      (rel) => !entityVisibility.some((ev) => ev.id === rel.id && ev.excluded)
    );
  }

  return mappedRealEstates;
};

// ### Hide / Show Entities ###
export const isEntityHidden = (
  entity: ResultEntity,
  config: ApiSearchResultSnapshotConfig
) => {
  return (config.entityVisibility || []).some(
    (ev) => ev.id === entity.id && ev.excluded
  );
};

export const toggleEntityVisibility = (
  entity: ResultEntity,
  config: ApiSearchResultSnapshotConfig
) => {
  return [
    ...(config.entityVisibility || []).filter((ev) => ev.id !== entity.id),
    {
      id: entity.id,
      excluded: !isEntityHidden(entity, config),
    },
  ];
};

// IMPORTANT - please, use the appropriate methods from the 'useTools' hook
// export const createDirectLink = (token: string): string =>
//   `${window.location.origin}/embed?token=${token}`;

// export const createCodeSnippet = (token: string) => {
//   return `
// <iframe
//   style="border: none"
//   width="100%"
//   height="100%"
//   src="${createDirectLink(token)}"
//   title="AreaButler Map Snippet"
// ></iframe>
//   `;
// };

export const deriveEntityGroupsByActiveMeans = (
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

export const deriveInitialEntityGroups = ({
  searchResponse,
  config,
  listings,
  locations,
  ignoreVisibility = false,
  ignorePoiFilter,
}: IDeriveParameters): EntityGroup[] => {
  const groupedEntities: EntityGroup[] = [];
  const centerOfSearch = searchResponse?.centerOfInterest?.coordinates;

  const deriveActiveState = (title: string, index?: number): boolean => {
    if (config?.theme === "KF") {
      const activeGroups = config?.defaultActiveGroups ?? [];

      return activeGroups.length < 1
        ? index === 0
        : activeGroups.includes(title);
    }

    return config?.defaultActiveGroups
      ? config.defaultActiveGroups.includes(title)
      : true;
  };

  if (!!locations && !!centerOfSearch) {
    groupedEntities.push({
      title: preferredLocationsTitle,
      active: deriveActiveState(preferredLocationsTitle),
      items: buildEntityDataFromPreferredLocations(centerOfSearch, locations),
    });
  }

  if (!!listings && !!centerOfSearch) {
    groupedEntities.push({
      title: realEstateListingsTitle,
      active: deriveActiveState(realEstateListingsTitle),
      items: buildEntDataFromRealEstates({
        centerOfSearch,
        config,
        ignoreVisibility,
        realEstates: listings,
      }),
    });
  }

  // TODO is triggered two times on map load, try to reduce to a 1 time only
  // POI filter by distance is in the "buildEntityData" method
  // Sorting could be excessive here
  const allEntities = buildEntityData(
    searchResponse,
    config,
    ignoreVisibility,
    ignorePoiFilter
  )?.sort(
    (
      { distanceInMeters: distanceInMeters1 },
      { distanceInMeters: distanceInMeters2 }
    ) => distanceInMeters1 - distanceInMeters2
  );

  const initialGroupedEntities: EntityGroup[] = osmEntityTypes.map(
    ({ label }) => ({ title: label, active: true, items: [] })
  );

  const groupedEntitiesWithItems = (
    Array.isArray(allEntities) ? allEntities : []
  ).reduce((result, resultEntity) => {
    const foundEntityGroupItems = result.find(
      ({ title }) => title === resultEntity.label
    )?.items;

    if (
      !foundEntityGroupItems ||
      (!ignorePoiFilter &&
        config?.poiFilter?.type === PoiFilterTypesEnum.BY_AMOUNT &&
        config?.poiFilter?.value! === foundEntityGroupItems.length)
    ) {
      return result;
    }

    foundEntityGroupItems.push(resultEntity);

    return result;
  }, initialGroupedEntities);

  return groupedEntitiesWithItems.reduce<EntityGroup[]>(
    (result, entityGroup, i) => {
      if (entityGroup.items.length > 0) {
        entityGroup.active = deriveActiveState(entityGroup.title, i);
        result.push(entityGroup);
      }

      return result;
    },
    groupedEntities
  );
};

export const sanitizeFilename = (filename: string): string =>
  filename.replace(/[/\\?%*:|"<>]/g, "-");

// TODO move to shared map-menu functions
export const setBackgroundColor = (
  node: HTMLDivElement | null,
  color: string
): void => {
  if (!node) {
    return;
  }

  if (node.parentElement?.classList.contains("collapse-open")) {
    node.style.setProperty("background", color, "important");
    return;
  }

  node.style.setProperty("background", "#FFFFFF", "important");
};

export const getQueryParamsAndUrl = <T>():
  | IQueryParamsAndUrl<T>
  | undefined => {
  const currentUrl = window.location.href;
  const parsedUrl = currentUrl.match(/^(.*)\?(.*)$/);

  if (parsedUrl?.length !== 3) {
    return;
  }

  return {
    queryParams: parsedUrl[2].split("&").reduce((result, currentParam) => {
      const keyValue = currentParam.split("=");
      // @ts-ignore
      result[keyValue[0]] = keyValue[1];

      return result;
    }, {} as T),
    url: parsedUrl[1],
  };
};

export const copyTextToClipboard = (text?: string): void => {
  if (!text) {
    return;
  }

  const isCopied = copy(text);

  if (isCopied) {
    toastSuccess("Erfolgreich in Zwischenablage kopiert!");
  }
};

export const filterQueryParams = (queryParams: URLSearchParams): void => {
  const paramsToDel: string[] = [];

  queryParams.forEach((value, key) => {
    if (["undefined", "null", ""].includes(value)) {
      paramsToDel.push(key);
    }
  });

  paramsToDel.forEach((key) => {
    queryParams.delete(key);
  });
};
