import { render } from "@testing-library/react";

import MapMenuKarlaFricke from "./MapMenuKarlaFricke";

describe("MapMenuKarlaFricke", () => {
  test("should mount", async () => {
    const component = render(
      <MapMenuKarlaFricke
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
        isMapMenuOpen={false}
        isShownPreferredLocationsModal={false}
        togglePreferredLocationsModal={() => {}}
      />
    );
    expect(component).toBeDefined();
    // TODO the test should be updated
    // each group is rendered inside mobile & desktop menu & in hidden mobile dropdown
    // expect(component.container.querySelectorAll("li")).toHaveLength(3);
  });
});
