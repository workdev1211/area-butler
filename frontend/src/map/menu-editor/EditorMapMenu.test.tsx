import { render } from "@testing-library/react";
import EditorMapMenu from "./EditorMapMenu";
import { ApiSearchResultSnapshotConfig } from "../../../../shared/types/types";

const testConfig: ApiSearchResultSnapshotConfig = {
  theme: "DEFAULT",
  showLocation: true,
  groupItems: true
};

describe("EditorMapMenu", () => {
  test("should render", () => {
    const component = render(
      <EditorMapMenu
        availableMeans={[]}
        groupedEntries={[]}
        config={testConfig}
        onConfigChange={jest.fn()}
      />
    );
    expect(component).toBeDefined();
  });
});
