import {
  geocodeByAddress,
  geocodeByLatLng,
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";
import harversine from "haversine";
import { toast } from "react-toastify";
import { v4 } from "uuid";

import {
  ApiCoordinates,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  ApiUser,
  IApiUserPoiIcon,
  MeansOfTransportation,
  OsmName,
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
import postOfficeIcon from "../assets/icons/pois/post_office.svg";
import motorwayLinkIcon from "../assets/icons/pois/motorway_link.svg";
import sportIcon from "../assets/icons/pois/sport.svg";
import preferredLocationIcon from "../assets/icons/icons-24-x-24-illustrated-ic-starred.svg";
import realEstateListingIcon from "../assets/icons/icons-20-x-20-outline-ic-ab.svg";
import {
  calculateMinutesToMeters,
  meansOfTransportations,
} from "../../../shared/constants/constants";
import { EntityGroup, ResultEntity } from "../components/SearchResultContainer";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { groupBy } from "../../../shared/functions/shared.functions";
import { IPoiIcon } from "./shared.types";

const tinyColor = require("tinycolor2");

export interface ColorPalette {
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  textColor: string;
}

export const dateDiffInDays = (d1: Date, d2: Date = new Date()) => {
  const oneDay = 24 * 60 * 60 * 1000;
  d1.setHours(0, 0, 0);
  d2.setHours(0, 0, 0);

  return Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
};

export const deriveGeocodeByAddress = async (address: string) => {
  const latlngResults = await geocodeByAddress(address);
  return await getLatLng(latlngResults[0]);
};

export const deriveGeocodeByPlaceId = async (placeId: string) => {
  const latlngResults = await geocodeByPlaceId(placeId);
  return await getLatLng(latlngResults[0]);
};

export const deriveAddressFromCoordinates = async (
  coordinates: ApiCoordinates
): Promise<{ label: string; value: { place_id: string } } | null> => {
  const places = await geocodeByLatLng(coordinates);

  if (places && places.length > 0) {
    const { formatted_address, place_id } = places[0];

    return {
      label: formatted_address,
      value: {
        place_id,
      },
    };
  } else {
    return null;
  }
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

export const deriveMinutesFromMeters = (
  distanceInMeters: number,
  mean: MeansOfTransportation
) => {
  return Math.round(
    distanceInMeters /
      (calculateMinutesToMeters.find((mtm) => mtm.mean === mean)
        ?.multiplicator || 1)
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
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const toastError = (
  message: string,
  closeTimeMs: number | false = 3000,
  onClose = () => {}
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

export const realEstateListingsTitle = "Meine Objekte";
export const realEstateListingsTitleEmbed = "Weitere Objekte";
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

export const deriveColorPalette = (hexColor: string): ColorPalette => {
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
    case OsmName.park:
      return {
        icon: parkIcon,
        color: "#165B4E",
      };
    case OsmName.chemist:
      return {
        icon: chemistIcon,
        color: "#267F9D",
      };
    case OsmName.supermarket:
      return {
        icon: chemistIcon,
        color: "#267F9D",
      };
    case OsmName.kiosk:
      return {
        icon: chemistIcon,
        color: "#267F9D",
      };
    case OsmName.station:
      return {
        icon: stationIcon,
        color: "#CB513B",
      };
    case OsmName.bus_stop:
      return {
        icon: busStopIcon,
        color: "#C71362",
      };
    case OsmName.bar:
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
      return {
        icon: doctorsIcon,
        color: "#10A877",
      };
    case OsmName.dentist:
      return {
        icon: doctorsIcon,
        color: "#10A877",
      };
    case OsmName.clinic:
      return {
        icon: clinicIcon,
        color: "#42AEA7",
      };
    case OsmName.hospital:
      return {
        icon: clinicIcon,
        color: "#42AEA7",
      };
    case OsmName.post_office:
      return {
        icon: postOfficeIcon,
        color: "#66A3B7",
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
  ignoreVisibility?: boolean
): ResultEntity[] | null => {
  if (!locationSearchResult) {
    return null;
  }

  const allLocations = Object.values(locationSearchResult.routingProfiles)
    .map((a) =>
      a.locationsOfInterest.sort(
        (a, b) => a.distanceInMeters - b.distanceInMeters
      )
    )
    .flat();

  let allLocationIds = Array.from(
    new Set(allLocations.map((location) => location.entity.id))
  );

  if (config && config.entityVisibility && !ignoreVisibility) {
    const { entityVisibility = [] } = config;
    allLocationIds = allLocationIds.filter(
      (id) => !entityVisibility.some((ev) => ev.id === id && ev.excluded)
    );
  }

  return allLocationIds.map((locationId) => {
    const location = allLocations.find((l) => l.entity.id === locationId)!;

    return {
      id: locationId!,
      name: location.entity.name,
      label: location.entity.label,
      type: location.entity.type,
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
    };
  });
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
      type: OsmName.favorite,
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

export const buildEntityDataFromRealEstateListings = (
  centerCoordinates: ApiCoordinates,
  realEstateListings: ApiRealEstateListing[],
  config?: ApiSearchResultSnapshotConfig
): ResultEntity[] => {
  const deriveName = (realEstateListing: ApiRealEstateListing) => {
    const showLocation = config?.showLocation ?? false;

    if (!showLocation) {
      return `${realEstateListing.name}`;
    } else {
      return `${realEstateListing.name}`;
    }
  };

  const mappedRealEstateListings = realEstateListings
    .filter((realEstateListing) => !!realEstateListing.coordinates)
    .map((realEstateListing) => ({
      id: realEstateListing.id ?? v4(),
      name: deriveName(realEstateListing),
      label: realEstateListingsTitle,
      type: OsmName.property,
      distanceInMeters: distanceInMeters(
        centerCoordinates,
        realEstateListing.coordinates!
      ), // Calc distance
      realEstateData: {
        costStructure: realEstateListing.costStructure,
        characteristics: realEstateListing.characteristics,
      },
      coordinates: realEstateListing.coordinates!,
      address: config?.showLocation
        ? { street: realEstateListing.address }
        : { street: undefined },
      byFoot: true,
      byBike: true,
      byCar: true,
      selected: false,
      externalUrl: realEstateListing.externalUrl,
    }));

  if (config && config.entityVisibility) {
    const { entityVisibility = [] } = config;

    return mappedRealEstateListings.filter(
      (rel) => !entityVisibility.some((ev) => ev.id === rel.id && ev.excluded)
    );
  }

  return mappedRealEstateListings;
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

export const createDirectLink = (token: string) => {
  return `${window.location.origin}/embed?token=${token}`;
};

export const createCodeSnippet = (token: string) => {
  return `  
<iframe
  style="border: none"
  width="100%"
  height="100%"
  src="${createDirectLink(token)}"
  title="AreaButler Map Snippet"
></iframe>
  `;
};

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

export const deriveInitialEntityGroups = (
  searchResponse: ApiSearchResponse,
  config?: ApiSearchResultSnapshotConfig,
  listings?: ApiRealEstateListing[],
  locations?: ApiPreferredLocation[],
  ignoreVisibility?: boolean
): EntityGroup[] => {
  const groupedEntities: EntityGroup[] = [];
  const centerOfSearch = searchResponse?.centerOfInterest?.coordinates;

  const deriveActiveState = (title: string, index?: number): boolean => {
    if (config?.theme === "KF") {
      const activeGroups = config?.defaultActiveGroups ?? [];

      return (
        [realEstateListingsTitle].includes(title) ||
        (activeGroups.length < 1 ? index === 0 : activeGroups.includes(title))
      );
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
      items: buildEntityDataFromRealEstateListings(
        centerOfSearch,
        listings,
        config
      ),
    });
  }

  const allEntities = buildEntityData(searchResponse, config, ignoreVisibility);
  const newGroupedEntries: any[] = Object.entries(
    groupBy(allEntities, (item: ResultEntity) => item.label)
  );

  newGroupedEntries
    .map(([title, items], index) => ({
      title,
      active: deriveActiveState(title, index),
      items,
    }))
    .forEach((e) => groupedEntities.push(e));

  return groupedEntities;
};

export const sanitizeFilename = (filename: string): string =>
  filename.replace(/[/\\?%*:|"<>]/g, "-");
