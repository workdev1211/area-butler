import {
  MeansOfTransportation,
  OsmName,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import { PotentialCustomerDocument } from '../../potential-customer/schema/potential-customer.schema';
import { defaultTargetGroupName } from '../../../../shared/constants/potential-customer';
import {
  defaultPoiTypes,
  defaultTransportParams,
} from '../../../../shared/constants/location';

export const defaultPotentialCustomer: Partial<PotentialCustomerDocument> = {
  name: defaultTargetGroupName,
  preferredAmenities: [...defaultPoiTypes],
  routingProfiles: [...defaultTransportParams],
};

export const defaultPotentialCustomers: Partial<PotentialCustomerDocument>[] = [
  {
    name: 'Immobilieninteressent',
    routingProfiles: [
      {
        type: MeansOfTransportation.WALK,
        amount: 8,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.BICYCLE,
        amount: 15,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.CAR,
        amount: 40,
        unit: UnitsOfTransportation.MINUTES,
      },
    ],
    preferredAmenities: [
      OsmName.bus_stop,
      OsmName.motorway_link,
      OsmName.hospital,
      OsmName.park,
      OsmName.restaurant,
      OsmName.station,
      OsmName.supermarket,
      OsmName.bar,
      OsmName.doctors,
      OsmName.fitness_centre,
      OsmName.fuel,
      OsmName.post_office,
      OsmName.restaurant,
      OsmName.sports_centre,
      OsmName.sports_hall,
      OsmName.supermarket,
      // OsmName.swimming_pool,
      OsmName.theatre,
      OsmName.charging_station,
    ],
  },
  {
    name: 'Kapitalanleger',
    routingProfiles: [
      {
        type: MeansOfTransportation.WALK,
        amount: 10,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.BICYCLE,
        amount: 20,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.CAR,
        amount: 30,
        unit: UnitsOfTransportation.MINUTES,
      },
    ],
    preferredAmenities: [
      OsmName.bus_stop,
      OsmName.motorway_link,
      OsmName.chemist,
      OsmName.clinic,
      OsmName.dentist,
      OsmName.doctors,
      OsmName.hospital,
      OsmName.park,
      OsmName.restaurant,
      OsmName.station,
      OsmName.supermarket,
      OsmName.theatre,
      OsmName.attraction,
      OsmName.charging_station,
      OsmName.university,
    ],
  },
  {
    name: 'Senioren',
    routingProfiles: [
      {
        type: MeansOfTransportation.WALK,
        amount: 8,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.BICYCLE,
        amount: 15,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.CAR,
        amount: 40,
        unit: UnitsOfTransportation.MINUTES,
      },
    ],
    preferredAmenities: [
      OsmName.bus_stop,
      OsmName.motorway_link,
      OsmName.chemist,
      OsmName.clinic,
      OsmName.dentist,
      OsmName.doctors,
      OsmName.hospital,
      OsmName.park,
      OsmName.restaurant,
      OsmName.station,
      OsmName.supermarket,
      OsmName.theatre,
      OsmName.attraction,
    ],
  },
  {
    name: 'Double Income No Kids',
    routingProfiles: [
      {
        type: MeansOfTransportation.WALK,
        amount: 10,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.BICYCLE,
        amount: 15,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.CAR,
        amount: 45,
        unit: UnitsOfTransportation.MINUTES,
      },
    ],
    preferredAmenities: [
      OsmName.bar,
      OsmName.doctors,
      OsmName.fitness_centre,
      OsmName.fuel,
      OsmName.motorway_link,
      OsmName.post_office,
      OsmName.restaurant,
      OsmName.sports_centre,
      OsmName.sports_hall,
      OsmName.supermarket,
      OsmName.theatre,
    ],
  },
  {
    name: 'Singles',
    routingProfiles: [
      {
        type: MeansOfTransportation.WALK,
        amount: 10,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.BICYCLE,
        amount: 20,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.CAR,
        amount: 40,
        unit: UnitsOfTransportation.MINUTES,
      },
    ],
    preferredAmenities: [
      OsmName.bar,
      OsmName.doctors,
      OsmName.fitness_centre,
      OsmName.fuel,
      OsmName.motorway_link,
      OsmName.post_office,
      OsmName.restaurant,
      OsmName.school,
      OsmName.sports_centre,
      OsmName.sports_hall,
      OsmName.supermarket,
    ],
  },
  {
    name: 'Familien',
    routingProfiles: [
      {
        type: MeansOfTransportation.WALK,
        amount: 10,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.BICYCLE,
        amount: 15,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.CAR,
        amount: 30,
        unit: UnitsOfTransportation.MINUTES,
      },
    ],
    preferredAmenities: [
      OsmName.bus_stop,
      OsmName.chemist,
      OsmName.dentist,
      OsmName.doctors,
      OsmName.restaurant,
      OsmName.kindergarten,
      OsmName.park,
      OsmName.playground,
      OsmName.post_office,
      OsmName.school,
      OsmName.station,
      OsmName.supermarket,
      OsmName.sports_hall,
      OsmName.sports_centre,
      // OsmName.swimming_pool,
    ],
  },
  {
    name: 'Bürgerliche Haushalte',
    routingProfiles: [
      {
        type: MeansOfTransportation.WALK,
        amount: 10,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.BICYCLE,
        amount: 15,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.CAR,
        amount: 20,
        unit: UnitsOfTransportation.MINUTES,
      },
    ],
    preferredAmenities: [
      OsmName.bar,
      OsmName.bus_stop,
      OsmName.dentist,
      OsmName.doctors,
      OsmName.fuel,
      OsmName.hospital,
      OsmName.motorway_link,
      OsmName.park,
      OsmName.post_office,
      OsmName.station,
      OsmName.supermarket,
      // OsmName.swimming_pool,
    ],
  },
  {
    name: 'Studierende',
    routingProfiles: [
      {
        type: MeansOfTransportation.WALK,
        amount: 10,
        unit: UnitsOfTransportation.MINUTES,
      },
      {
        type: MeansOfTransportation.BICYCLE,
        amount: 25,
        unit: UnitsOfTransportation.MINUTES,
      },
    ],
    preferredAmenities: [
      OsmName.bar,
      OsmName.bus_stop,
      OsmName.fitness_centre,
      OsmName.park,
      OsmName.post_office,
      OsmName.sports_centre,
      OsmName.station,
      OsmName.supermarket,
      // OsmName.swimming_pool,
      OsmName.university,
    ],
  },
];
