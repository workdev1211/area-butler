import { render } from "@testing-library/react";

import EditorTab from "./EditorTab";
import { ApiSearchResultSnapshotConfig } from "../../../../../shared/types/types";

const testConfig: ApiSearchResultSnapshotConfig = {
  theme: "DEFAULT",
  showLocation: true,
  groupItems: true,
};

describe("EditorTab", () => {
  test("should render", () => {
    const component = render(
      <EditorTab
        snapshotId="a"
        availableMeans={[]}
        groupedEntries={[]}
        config={testConfig}
        onConfigChange={jest.fn()}
        saveConfig={jest.fn()}
      />
    );

    expect(component).toBeDefined();
  });
});
