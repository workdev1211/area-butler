import { render } from "@testing-library/react";
import CensusTable from "./CensusTable";
import {
  ApiDataProvisionEnum,
  ApiGeojsonFeature,
} from "../../../../../shared/types/types";
import { TCensusData } from "../../../hooks/censusdata";

const testData: any = {
  [ApiDataProvisionEnum.ADDRESS_DATA]: [
    {
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [9.954700469000045, 53.590614764000065],
          [9.954690912000046, 53.59960083800007],
          [9.969793940000045, 53.59960551800003],
          [9.969800311000029, 53.590619444000026],
          [9.954700469000045, 53.590614764000065],
        ],
      },
      type: "Feature",
      properties: [{ label: "Einwohner", unit: "", value: 2824 }],
    },
  ],
};

describe("CensusTable", () => {
  test("should render", async () => {
    const component = render(<CensusTable censusData={testData} />);
    expect(component).toBeDefined();
  });
});
