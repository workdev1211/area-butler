import { render } from "@testing-library/react";

import LocationIndexTable from "./LocationIndexTable";
import { TLocationIndexData } from "../../../hooks/locationindexdata";

const testData: TLocationIndexData = {
  eveningEntertainment: {
    name: "Restaurants, Bars & Clubs",
    value: 96,
    color: "#32cd32",
  },
  health: {
    name: "Medizin & Gesundheit",
    value: 85,
    color: "#32cd32",
  },
  nearSupply: {
    name: "Einkaufen & Nahversorgung",
    value: 97,
    color: "#32cd32",
  },
  publicTransport: {
    name: "ÖPNV Anbindung",
    value: 98,
    color: "#32cd32",
  },
  kids: {
    name: "Spielplätze & Früh-Bildung",
    value: 91,
    color: "#32cd32",
  },
  culture: {
    name: "Kultur & Universitäten",
    value: 78,
    color: "#32cd32",
  },
  sports: {
    name: "Sportliche Aktivitäten",
    value: 90,
    color: "#32cd32",
  },
  individualMobility: {
    name: "Individualmobilität",
    value: 80,
    color: "#32cd32",
  },
};

describe("LocationIndexTable", () => {
  test("should render", async () => {
    const component = render(
      <LocationIndexTable locationIndexData={testData} />
    );

    expect(component).toBeDefined();
  });
});
