import {ApiOsmEntity, MeansOfTransportation, OsmName, OsmType, UnitsOfTransportation} from "../types/types";

export const calculateMinutesToMeters = [
    {mean: MeansOfTransportation.WALK, multiplicator: 83},
    {mean: MeansOfTransportation.BICYCLE, multiplicator: 233},
    {mean: MeansOfTransportation.CAR, multiplicator: 338},
]

export const unitsOfTransportation = [
    {label: 'Minuten', type: UnitsOfTransportation.MINUTES},
    {label: 'Metern', type: UnitsOfTransportation.METERS}
]

export const meansOfTransportations = [
    {label: "Zu Fuß", type: MeansOfTransportation.WALK, mode: "walking"},
    {label: "Fahrrad", type: MeansOfTransportation.BICYCLE, mode: "cycling"},
    {label: "Auto", type: MeansOfTransportation.CAR, mode: "driving"},
];

export const osmEntityTypes: ApiOsmEntity[] = [
  {
    type: OsmType.leisure,
    name: OsmName.playground,
    label: "Spielplatz",
    uniqueRadius: 50,
    uniqueTreshold: 0.5
  },
  {
    type: OsmType.amenity,
    name: OsmName.school,
    label: "Schule",
    uniqueRadius: 50,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.bar,
    label: "Bar",
    uniqueRadius: 50,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.amenity,
    name: OsmName.restaurant,
    label: "Restaurant",
    uniqueRadius: 50,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.leisure,
    name: OsmName.park,
    label: "Park",
    uniqueRadius: 200,
    uniqueTreshold: 0.5
  },
  {
    type: OsmType.shop,
    name: OsmName.chemist,
    label: "Drogerie",
    uniqueRadius: 50,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.shop,
    name: OsmName.supermarket,
    label: "Supermarkt",
    uniqueRadius: 50,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.doctors,
    label: "Arzt",
    uniqueRadius: 100,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.dentist,
    label: "Zahnarzt",
    uniqueRadius: 100,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.clinic,
    label: "Klinik",
    uniqueRadius: 500,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.kiosk,
    label: "Kiosk",
    uniqueRadius: 50,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.amenity,
    name: OsmName.post_office,
    label: "Kiosk/Paketshop",
    uniqueRadius: 50,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.amenity,
    name: OsmName.fuel,
    label: "Tankstelle",
    uniqueRadius: 50,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.public_transport,
    name: OsmName.station,
    label: "Öff. Schienenverkehr",
    uniqueRadius: 100,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.highway,
    name: OsmName.bus_stop,
    label: "Bushaltestelle",
    uniqueRadius: 500,
    uniqueTreshold: 0.5
  },
  {
    type: OsmType.highway,
    name: OsmName.motorway_link,
    label: "Autobahnauffahrt",
    uniqueRadius: 500,
    uniqueTreshold: 0.4
  },
];
