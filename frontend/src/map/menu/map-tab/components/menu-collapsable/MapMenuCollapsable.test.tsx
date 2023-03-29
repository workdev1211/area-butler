import { render } from "@testing-library/react";
import MapMenuCollapsable from "./MapMenuCollapsable";

describe("MapMenuCollapsable", () => {
  test("should render", async () => {
    const component = render(<MapMenuCollapsable title="test" />);
    expect(component).toBeDefined();
  });
});
