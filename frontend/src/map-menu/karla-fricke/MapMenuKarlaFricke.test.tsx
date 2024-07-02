import { render } from "@testing-library/react";

import MapMenuKarlaFricke from "./MapMenuKarlaFricke";
import { EntityGroup } from "../../shared/search-result.types";
import { OsmName } from "../../../../shared/types/types";

describe("MapMenuKarlaFricke", () => {
  const groupedEntries: EntityGroup[] = [
    {
      title: OsmName.park,
      active: true,
      items: [
        {
          id: "test-id",
          osmName: OsmName.bus_stop,
          label: "Park-Item",
          address: {
            city: "TestCity",
          },
          byFoot: true,
          byBike: true,
          byCar: true,
          realEstateData: {},
          coordinates: {
            lat: 2,
            lng: 5,
          },
          distanceInMeters: 5,
        },
      ],
    },
  ];

  test("should mount", async () => {
    const component = render(
      <MapMenuKarlaFricke
        groupedEntries={[]}
        isMapMenuOpen={false}
        isShownPreferredLocationsModal={false}
        togglePreferredLocationsModal={() => {}}
      />
    );
    expect(component).toBeDefined();
  });

  test("should render groups", async () => {
    const component = render(
      <MapMenuKarlaFricke
        groupedEntries={groupedEntries}
        isMapMenuOpen={false}
        isShownPreferredLocationsModal={false}
        togglePreferredLocationsModal={() => {}}
      />
    );
    expect(component).toBeDefined();
    // each group is rendered inside mobile & desktop menu & in hidden mobile dropdown
    expect(component.container.querySelectorAll("li")).toHaveLength(3);
  });
});
