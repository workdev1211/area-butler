import { ApiOsmEntity, MeansOfTransportation } from "../types/types";

export const meansOfTransportations = [
    { label: 'Zu Fuß', type: MeansOfTransportation.WALK },
    { label: 'Fahrrad', type: MeansOfTransportation.BICYCLE },
    { label: 'Auto', type: MeansOfTransportation.CAR },
];

export const osmEntityTypes: ApiOsmEntity[] = [
    {
        type: 'leisure',
        name: 'playground',
        label: 'Spielplatz'
    },
    {
        type: 'amenity',
        name: 'school',
        label: 'Schule'
    }, {
        type: 'amenity',
        name: 'bar',
        label: 'Bar'
    }, {
        type: 'amenity',
        name: 'restaurant',
        label: 'Restaurant'
    }, {
        type: 'leisure',
        name: 'park',
        label: 'Park'
    }, {
        type: 'shop',
        name: 'chemist',
        label: 'Drogerie'
    }, {
        type: 'shop',
        name: 'supermarket',
        label: 'Supermarkt'
    }, {
        type: 'amenity',
        name: 'doctors',
        label: 'Arzt'
    }, {
        type: 'amenity',
        name: 'dentist',
        label: 'Zahnarzt'
    }, {
        type: 'amenity',
        name: 'clinic',
        label: 'Klinik'
    }, {
        type: 'amenity',
        name: 'kiosk',
        label: 'Kiosk/Paketshop'
    }, {
        type: 'amenity',
        name: 'post office',
        label: 'Kiosk/Paketshop'
    }, {
        type: 'amenity',
        name: 'fuel',
        label: 'Tankstelle'
    }, {
        type: 'public_transport',
        name: 'station',
        label: 'ÖPNV Haltestelle'
    }, {
        type: 'highway',
        name: 'motorway_link',
        label: 'Autobahnauffahrt'
    },
]