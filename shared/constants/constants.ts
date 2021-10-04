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
  },
  {
    type: OsmType.amenity,
    name: OsmName.school,
    label: "Schule",
  },
  {
    type: OsmType.amenity,
    name: OsmName.bar,
    label: "Bar",
  },
  {
    type: OsmType.amenity,
    name: OsmName.restaurant,
    label: "Restaurant",
  },
  {
    type: OsmType.leisure,
    name: OsmName.park,
    label: "Park",
  },
  {
    type: OsmType.shop,
    name: OsmName.chemist,
    label: "Drogerie",
  },
  {
    type: OsmType.shop,
    name: OsmName.supermarket,
    label: "Supermarkt",
  },
  {
    type: OsmType.amenity,
    name: OsmName.doctors,
    label: "Arzt",
  },
  {
    type: OsmType.amenity,
    name: OsmName.dentist,
    label: "Zahnarzt",
  },
  {
    type: OsmType.amenity,
    name: OsmName.clinic,
    label: "Klinik",
  },
  {
    type: OsmType.amenity,
    name: OsmName.kiosk,
    label: "Kiosk",
  },
  {
    type: OsmType.amenity,
    name: OsmName.post_office,
    label: "Kiosk/Paketshop",
  },
  {
    type: OsmType.amenity,
    name: OsmName.fuel,
    label: "Tankstelle",
  },
  {
    type: OsmType.public_transport,
    name: OsmName.station,
    label: "Öff. Schienenverkehr",
  },
  {
    type: OsmType.highway,
    name: OsmName.bus_stop,
    label: "Bushaltestelle",
  },
  {
    type: OsmType.highway,
    name: OsmName.motorway_link,
    label: "Autobahnauffahrt",
  },
];
