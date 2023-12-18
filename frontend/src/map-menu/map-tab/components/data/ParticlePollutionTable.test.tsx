import { render } from "@testing-library/react";
import ParticlePollutionTable from "./ParticlePollutionTable";
import { ApiGeojsonFeature } from "../../../../../../shared/types/types";

const testData: ApiGeojsonFeature[] = [
  {
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [9.969808192483022, 53.585112982473085],
            [9.970302315786604, 53.60668235223972],
            [10.006569257747595, 53.60638279596677],
            [10.006056673079602, 53.584813660746015],
            [9.969808192483022, 53.585112982473085]
          ]
        ]
      ]
    },
    type: "Feature",
    properties: {
      Index: 1210295,
      MEAN: 14.59,
      "Tage mit Tagesmittelwerten > 50 �g/m�": 1,
      ERR: 0,
      Shape_Length: 9600,
      Shape_Area: 5760000
    }
  }
];

describe("ParticlePollutionTable", () => {
  test("should render", async () => {
    const component = render(
      <ParticlePollutionTable particlePollutionData={testData} />
    );
    expect(component).toBeDefined();
  });
});
