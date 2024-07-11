import { render } from "@testing-library/react";

import MapMenuListItem from "./MapMenuListItem";
import { EntityGroup } from "../../../shared/search-result.types";
import { OsmName } from "../../../../../shared/types/types";

describe("MapMenuListItem", () => {
  const entityGroup = {
    active: true,
    items: [
      {
        id: "test-id",
        name: "Park-Item",
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
    name: OsmName.park,
  } as EntityGroup;

  test("should render", async () => {
    const component = render(
      <MapMenuListItem
        entityGroup={entityGroup}
        groupIcon={{ icon: "test", color: "#000000" }}
        entityGroupIndex={0}
        routes={[]}
        toggleRoute={jest.fn()}
        transitRoutes={[]}
        toggleTransitRoute={jest.fn()}
      />
    );
    expect(component).toBeDefined();
  });
});
