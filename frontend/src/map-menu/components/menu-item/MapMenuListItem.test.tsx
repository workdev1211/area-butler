import { render } from "@testing-library/react";

import MapMenuListItem from "./MapMenuListItem";
import { EntityGroup } from "../../../shared/search-result.types";

describe("MapMenuListItem", () => {
  const entityGroup = {
    title: "Park",
    active: true,
    items: [
      {
        id: "test-id",
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
