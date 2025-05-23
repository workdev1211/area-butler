import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  OsmName,
  OsmType,
  PoiGroupEnum,
} from "../types/types";

// single source of truth for pois
export const osmEntityTypes: ApiOsmEntity[] = [
  {
    type: OsmType.public_transport,
    name: OsmName.station,
    groupName: OsmName.station,
    label: "Schienenverkehr",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 200,
    uniqueThreshold: 0.4,
  },
  {
    type: OsmType.railway,
    name: OsmName.tram_stop,
    groupName: OsmName.station,
    label: "Tram-Station",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 200,
    uniqueThreshold: 0.4,
  },
  {
    type: OsmType.highway,
    name: OsmName.bus_stop,
    groupName: OsmName.bus_stop,
    label: "Bushaltestelle",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 100,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.highway,
    name: OsmName.motorway_link,
    groupName: OsmName.motorway_link,
    label: "Autobahnauffahrt",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 500,
    uniqueThreshold: 0.4,
  },
  {
    type: OsmType.amenity,
    name: OsmName.charging_station,
    groupName: OsmName.charging_station,
    label: "E-Ladestation",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.fuel,
    groupName: OsmName.fuel,
    label: "Tankstelle",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 50,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.shop,
    name: OsmName.supermarket,
    groupName: OsmName.supermarket,
    label: "Supermarkt",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.shop,
    name: OsmName.chemist,
    groupName: OsmName.chemist,
    label: "Drogerie",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.kiosk,
    groupName: PoiGroupEnum.kiosk_post_office,
    label: "Kiosk/Paketshop",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.post_office,
    groupName: PoiGroupEnum.kiosk_post_office,
    label: "Kiosk/Paketshop",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.kindergarten,
    groupName: OsmName.kindergarten,
    label: "Kindergarten",
    category: ApiOsmEntityCategory.EDUCATION,
    uniqueRadius: 100,
    uniqueThreshold: 0.4,
  },
  {
    type: OsmType.amenity,
    name: OsmName.childcare,
    groupName: OsmName.kindergarten,
    label: "Kinderbetreuung",
    category: ApiOsmEntityCategory.EDUCATION,
    uniqueRadius: 100,
    uniqueThreshold: 0.4,
  },
  {
    type: OsmType.amenity,
    name: OsmName.school,
    groupName: OsmName.school,
    label: "Schule",
    category: ApiOsmEntityCategory.EDUCATION,
    uniqueRadius: 50,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.university,
    groupName: OsmName.university,
    label: "Universität",
    category: ApiOsmEntityCategory.EDUCATION,
    uniqueRadius: 400,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.playground,
    groupName: OsmName.playground,
    label: "Spielplatz",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.park,
    groupName: OsmName.park,
    label: "Park",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 200,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.restaurant,
    groupName: OsmName.restaurant,
    label: "Restaurant",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.bar,
    groupName: PoiGroupEnum.bar_pub,
    label: "Bar",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.pub,
    groupName: PoiGroupEnum.bar_pub,
    label: "Bar",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.theatre,
    groupName: OsmName.theatre,
    label: "Theater",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 500,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.fitness_centre,
    groupName: OsmName.fitness_centre,
    label: "Fitness",
    category: ApiOsmEntityCategory.SPORT,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  // {
  //   type: OsmType.leisure,
  //   name: OsmName.swimming_pool,
  //   groupName: OsmName.swimming_pool,
  //   label: "Schwimmbad",
  //   category: ApiOsmEntityCategory.SPORT,
  //   uniqueRadius: 100,
  //   uniqueThreshold: 0.5,
  //   // It's a temporary workaround (a hack) to prevent the addition the third Osm parameter
  //   replacementQuery: `["${OsmType.leisure}"="${OsmName.sports_centre}"]["sport"="swimming"]`,
  // },
  {
    type: OsmType.leisure,
    name: OsmName.sports_centre,
    groupName: OsmName.sports_centre,
    label: "Sportcenter",
    category: ApiOsmEntityCategory.SPORT,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
    additionalQuery: '["sport"!="swimming"]',
  },
  {
    type: OsmType.leisure,
    name: OsmName.sports_hall,
    groupName: OsmName.sports_hall,
    label: "Sporthalle",
    category: ApiOsmEntityCategory.SPORT,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.pharmacy,
    groupName: OsmName.pharmacy,
    label: "Apotheken",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.doctors,
    groupName: OsmName.doctors,
    label: "Arzt",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 100,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.dentist,
    groupName: OsmName.doctors,
    label: "Zahnarzt",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 100,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.clinic,
    groupName: OsmName.hospital,
    label: "Klinik",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 500,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.hospital,
    groupName: OsmName.hospital,
    label: "Krankenhaus",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 1000,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.parking,
    name: OsmName.surface,
    groupName: OsmName.surface,
    label: "Parkplatz",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.parking,
    name: OsmName["multi-storey"],
    groupName: OsmName.surface,
    label: "Parkhaus",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.parking,
    name: OsmName.underground,
    groupName: OsmName.surface,
    label: "Parkhaus",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
    additionalQuery: '["access"!="private"]',
  },
  {
    type: OsmType["generator:method"],
    name: OsmName.wind_turbine,
    groupName: OsmName.wind_turbine,
    label: "Windrad",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.power,
    name: OsmName.tower,
    groupName: PoiGroupEnum.power_pole,
    label: "Strommast",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.power,
    name: OsmName.pole,
    groupName: PoiGroupEnum.power_pole,
    label: "Strommast",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.tourism,
    name: OsmName.hotel,
    groupName: OsmName.hotel,
    label: "Hotels",
    category: ApiOsmEntityCategory.TOURISM,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.tourism,
    name: OsmName.museum,
    groupName: OsmName.museum,
    label: "Museum",
    category: ApiOsmEntityCategory.TOURISM,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.tourism,
    name: OsmName.attraction,
    groupName: OsmName.attraction,
    label: "Sehenswürdigkeiten",
    category: ApiOsmEntityCategory.TOURISM,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
];
