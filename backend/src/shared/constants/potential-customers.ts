import {
  MeansOfTransportation,
  OsmName,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import { PotentialCustomerDocument } from '../../potential-customer/schema/potential-customer.schema';

export const defaultPotentialCustomers: Partial<PotentialCustomerDocument>[] = [
  {
    name: 'Aktive Senioren',
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
      OsmName.bus_stop,
      OsmName.chemist,
      OsmName.clinic,
      OsmName.dentist,
      OsmName.doctors,
      OsmName.hospital,
      OsmName.park,
      OsmName.restaurant,
      OsmName.station,
      OsmName.supermarket,
      // OsmName.swimming_pool,
      OsmName.theatre,
    ],
  },
  {
    name: 'Etablierte Performer',
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
      OsmName.doctors,
      OsmName.fitness_centre,
      OsmName.fuel,
      OsmName.motorway_link,
      OsmName.post_office,
      OsmName.restaurant,
      OsmName.sports_centre,
      OsmName.sports_hall,
      OsmName.supermarket,
      // OsmName.swimming_pool,
      OsmName.theatre,
    ],
  },
  {
    name: 'Young Professionals',
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
    name: '(Junge) Familien',
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
      // OsmName.swimming_pool,
    ],
  },
  {
    name: 'Konservative / Pragmatische Mitte',
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
        amount: 15,
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
      OsmName.sports_hall,
      OsmName.station,
      OsmName.supermarket,
      // OsmName.swimming_pool,
      OsmName.university,
    ],
  },
];
