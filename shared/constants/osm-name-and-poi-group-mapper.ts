import { OsmName, PoiGroupEnum, TPoiGroupName } from "../types/types";

// TODO should be memoized in the poi hook
// TODO single source of truth

export class OsmNameAndPoiGroupMapper {
  private readonly initialMapping: [OsmName, TPoiGroupName][] = [
    [OsmName.station, OsmName.station],
    [OsmName.bus_stop, OsmName.bus_stop],
    [OsmName.motorway_link, OsmName.motorway_link],
    [OsmName.charging_station, OsmName.charging_station],
    [OsmName.fuel, OsmName.fuel],
    [OsmName.supermarket, OsmName.supermarket],
    [OsmName.chemist, OsmName.chemist],
    [OsmName.kiosk, PoiGroupEnum.kiosk_post_office],
    [OsmName.post_office, PoiGroupEnum.kiosk_post_office],
    [OsmName.kindergarten, OsmName.kindergarten],
    [OsmName.school, OsmName.school],
    [OsmName.university, OsmName.university],
    [OsmName.playground, OsmName.playground],
    [OsmName.park, OsmName.park],
    [OsmName.restaurant, OsmName.restaurant],
    [OsmName.bar, PoiGroupEnum.bar_pub],
    [OsmName.pub, PoiGroupEnum.bar_pub],
    [OsmName.theatre, OsmName.theatre],
    [OsmName.fitness_centre, OsmName.fitness_centre],
    [OsmName.sports_centre, OsmName.sports_centre],
    [OsmName.sports_hall, OsmName.sports_hall],
    [OsmName.pharmacy, OsmName.pharmacy],
    [OsmName.doctors, OsmName.doctors],
    [OsmName.dentist, OsmName.dentist],
    [OsmName.clinic, OsmName.clinic],
    [OsmName.hospital, OsmName.hospital],
    [OsmName.surface, OsmName.surface],
    [OsmName["multi-storey"], OsmName["multi-storey"]],
    [OsmName.underground, OsmName.underground],
    [OsmName.wind_turbine, OsmName.wind_turbine],
    [OsmName.tower, OsmName.tower],
    [OsmName.pole, OsmName.pole],
    [OsmName.hotel, OsmName.hotel],
    [OsmName.museum, OsmName.museum],
    [OsmName.attraction, OsmName.attraction],
    [OsmName.favorite, OsmName.favorite],
    [OsmName.property, OsmName.property],
  ];

  private readonly directMapping: Map<OsmName, TPoiGroupName>;
  private readonly reverseMapping: Map<TPoiGroupName, Set<OsmName>>;

  constructor() {
    this.directMapping = new Map(this.initialMapping);

    this.reverseMapping = this.initialMapping.reduce<
      Map<TPoiGroupName, Set<OsmName>>
    >((result, [osmName, groupName]) => {
      const existingMapping = result.get(groupName);

      if (existingMapping) {
        result.set(groupName, existingMapping.add(osmName));
      } else {
        result.set(groupName, new Set([osmName]));
      }

      return result;
    }, new Map());
  }

  get(osmName: OsmName): TPoiGroupName | undefined {
    return this.directMapping.get(osmName);
  }

  revGet(groupName: TPoiGroupName): OsmName[] {
    const osmNames = this.reverseMapping.get(groupName);
    return osmNames ? Array.from(osmNames) : [];
  }
}
