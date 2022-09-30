import { createMemoryHistory } from "history";
import { render } from "@testing-library/react";
import { Router } from "react-router-dom";

import Authenticated from "./Authenticated";

describe("Authenticated", () => {
  test("should render", async () => {
    const history = createMemoryHistory();

    const component = render(
      <Router history={history}>
        <Authenticated />
      </Router>
    );

    expect(component).toBeDefined();
  });
});
