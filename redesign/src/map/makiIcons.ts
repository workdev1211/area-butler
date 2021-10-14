import {OsmName} from "../../../shared/types/types";
import playground from '../assets/icons/playground.svg';
import school from '../assets/icons/school.svg';
import bar from '../assets/icons/bar.svg';
import restaurant from '../assets/icons/restaurant.svg';
import park from '../assets/icons/park.svg';
import convenience from '../assets/icons/convenience.svg';
import grocery from '../assets/icons/grocery.svg';
import doctor from '../assets/icons/doctor.svg';
import dentist from '../assets/icons/dentist.svg';
import hospital from '../assets/icons/hospital.svg';
import alcoholShop from '../assets/icons/alcohol-shop.svg';
import postOffice from '../assets/icons/post.svg';
import fuel from '../assets/icons/fuel.svg';
import railMetro from '../assets/icons/rail-metro.svg';
import bus from '../assets/icons/bus.svg';
import car from '../assets/icons/car.svg';
import triangle from '../assets/icons/triangle.svg';
import star from '../assets/icons/star.svg'
import house from '../assets/icons/home.svg';

export const osmNameToIcons = [
    {
        name: OsmName.playground,
        icon: playground
    },
    {
        name: OsmName.school,
        icon: school
    },
    {
        name: OsmName.bar,
        icon: bar
    },
    {
        name: OsmName.restaurant,
        icon: restaurant
    },
    {
        name: OsmName.park,
        icon: park
    },
    {
        name: OsmName.chemist,
        icon: convenience
    },
    {
        name: OsmName.supermarket,
        icon: grocery
    },
    {
        name: OsmName.doctors,
        icon: doctor
    },
    {
        name: OsmName.dentist,
        icon: dentist
    },
    {
        name: OsmName.clinic,
        icon: hospital
    },
    {
        name: OsmName.kiosk,
        icon: alcoholShop
    },
    {
        name: OsmName.post_office,
        icon: postOffice
    },
    {
        name: OsmName.fuel,
        icon: fuel
    },
    {
        name: OsmName.station,
        icon: railMetro
    },
    {
        name: OsmName.bus_stop,
        icon: bus
    },
    {
        name: OsmName.motorway_link,
        icon: car
    },
    {
        name: OsmName.favorite,
        icon: star
    },
    {
        name: OsmName.property,
        icon: house
    },
]

export const fallbackIcon = triangle;
