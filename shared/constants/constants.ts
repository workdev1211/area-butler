import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  MeansOfTransportation,
  OsmName,
  OsmType,
  UnitsOfTransportation
} from "../types/types";

export const kudibaCompany = {
  name: 'KuDiBa GmbH i. G.',
  address1: 'c/o Hamburger Ding',
  address2: 'Nobistor 16',
  zip: '22767',
  city: 'Hamburg',
  mail: 'info@area-butler.de',
  formattedAddress: () => `${kudibaCompany.name}<br />${kudibaCompany.address1}<br />${kudibaCompany.address2}<br />${kudibaCompany.zip} ${kudibaCompany.city}`,
  court: 'Amtsgericht Hamburg',
  regNr: 'xxxxxxxxxxx',
  vat: 'VAT12343434'
}

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
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueTreshold: 0.5
  },
  {
    type: OsmType.leisure,
    name: OsmName.park,
    label: "Park",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 200,
    uniqueTreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.school,
    label: "Schule",
    category: ApiOsmEntityCategory.EDUCATION,
    uniqueRadius: 50,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.bar,
    label: "Bar",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.amenity,
    name: OsmName.restaurant,
    label: "Restaurant",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.shop,
    name: OsmName.chemist,
    label: "Drogerie",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.shop,
    name: OsmName.supermarket,
    label: "Supermarkt",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.doctors,
    label: "Arzt",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 100,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.dentist,
    label: "Zahnarzt",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 100,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.clinic,
    label: "Klinik",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 500,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.amenity,
    name: OsmName.kiosk,
    label: "Kiosk",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.amenity,
    name: OsmName.post_office,
    label: "Kiosk/Paketshop",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueTreshold: 0.8
  },
  {
    type: OsmType.amenity,
    name: OsmName.fuel,
    label: "Tankstelle",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 50,
    uniqueTreshold: 0.6
  },
  {
    type: OsmType.highway,
    name: OsmName.motorway_link,
    label: "Autobahnauffahrt",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 500,
    uniqueTreshold: 0.4
  },
  {
    type: OsmType.public_transport,
    name: OsmName.station,
    label: "Öff. Schienenverkehr",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 200,
    uniqueTreshold: 0.4
  },
  {
    type: OsmType.highway,
    name: OsmName.bus_stop,
    label: "Bushaltestelle",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 500,
    uniqueTreshold: 0.5
  }
];
