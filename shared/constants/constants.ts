import { ApiOsmEntity, MeansOfTransportation, OsmName, OsmType } from "../types/types";

export const meansOfTransportations = [
    { label: 'Zu Fuß', type: MeansOfTransportation.WALK },
    { label: 'Fahrrad', type: MeansOfTransportation.BICYCLE },
    { label: 'Auto', type: MeansOfTransportation.CAR },
];

export const osmEntityTypes: ApiOsmEntity[] = [
    {
        type: OsmType.leisure,
        name: OsmName.playground,
        label: 'Spielplatz'
    },
    {
        type: OsmType.amenity,
        name: OsmName.school,
        label: 'Schule'
    }, {
        type: OsmType.amenity,
        name: OsmName.bar,
        label: 'Bar'
    }, {
        type: OsmType.amenity,
        name: OsmName.restaurant,
        label: 'Restaurant'
    }, {
        type: OsmType.leisure,
        name: OsmName.park,
        label: 'Park'
    }, {
        type: OsmType.shop,
        name: OsmName.chemist,
        label: 'Drogerie'
    }, {
        type: OsmType.shop,
        name: OsmName.supermarket,
        label: 'Supermarkt'
    }, {
        type: OsmType.amenity,
        name: OsmName.doctors,
        label: 'Arzt'
    }, {
        type: OsmType.amenity,
        name: OsmName.dentist,
        label: 'Zahnarzt'
    }, {
        type: OsmType.amenity,
        name: OsmName.clinic,
        label: 'Klinik'
    }, {
        type: OsmType.amenity,
        name: OsmName.kiosk,
        label: 'Kiosk/Paketshop'
    }, {
        type: OsmType.amenity,
        name: OsmName.post_office,
        label: 'Kiosk/Paketshop'
    }, {
        type: OsmType.amenity,
        name: OsmName.fuel,
        label: 'Tankstelle'
    }, {
        type: OsmType.public_transport,
        name: OsmName.station,
        label: 'ÖPNV Haltestelle'
    }, {
        type: OsmType.highway,
        name: OsmName.motorway_link,
        label: 'Autobahnauffahrt'
    },
]