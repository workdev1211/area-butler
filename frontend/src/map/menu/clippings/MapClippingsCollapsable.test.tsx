import { render } from "@testing-library/react";
import MapClippingsCollapsable from "./MapClippingsCollapsable";

describe("MapClippingsCollapsable", () => {
  test("should render", async () => {
    const component = render(
      <MapClippingsCollapsable clippings={[]} searchAddress="test" />
    );
    expect(component).toBeDefined();
  });
});
