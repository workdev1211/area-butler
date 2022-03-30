import { render } from "@testing-library/react";
import MapMenuKarlaFricke from "./MapMenuKarlaFricke";
import { EntityGroup } from "../../../components/SearchResultContainer";

describe("MapMenuKarlaFricke", () => {
  const groupedEntries: EntityGroup[] = [
    {
      title: "Park",
      active: true,
      items: [
        {
          id: "test-id",
          type: "test",
          label: "Park-Item",
          address: {
            city: "TestCity"
          },
          byFoot: true,
          byBike: true,
          byCar: true,
          realEstateData: {},
          coordinates: {
            lat: 2,
            lng: 5
          },
          distanceInMeters: 5
        }
      ]
    }
  ];

  test("should mount", async () => {
    const component = render(
      <MapMenuKarlaFricke
        groupedEntries={[]}
        activateGroup={jest.fn()}
        mobileMenuOpen={false}
      />
    );
    expect(component).toBeDefined();
  });

  test("should render groups", async () => {
    const component = render(
      <MapMenuKarlaFricke
        groupedEntries={groupedEntries}
        activateGroup={jest.fn()}
        mobileMenuOpen={false}
      />
    );
    expect(component).toBeDefined();
    // each group is rendered inside mobile & desktop menu & in hidden mobile dropdown
    expect(component.container.querySelectorAll("li")).toHaveLength(3);
  });
});
