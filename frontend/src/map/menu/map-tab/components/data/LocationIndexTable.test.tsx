import { render } from "@testing-library/react";

import LocationIndexTable from "./LocationIndexTable";
import { TLocationIndexData } from "../../../../../hooks/locationindexdata";

const testData: TLocationIndexData = {
  eveningEntertainment: {
    name: "Restaurants, Bars & Clubs",
    value: 96,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  health: {
    name: "Medizin & Gesundheit",
    value: 85,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  nearSupply: {
    name: "Einkaufen & Nahversorgung",
    value: 97,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  publicTransport: {
    name: "ÖPNV Anbindung",
    value: 98,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  kids: {
    name: "Spielplätze & Früh-Bildung",
    value: 91,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  culture: {
    name: "Kultur & Universitäten",
    value: 78,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  sports: {
    name: "Sportliche Aktivitäten",
    value: 90,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  individualMobility: {
    name: "Individualmobilität",
    value: 80,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
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
