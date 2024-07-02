import { render } from "@testing-library/react";

import LocationIndexTable from "./LocationIndexTable";
import {
  LocIndexPropsEnum,
  TLocationIndexData,
} from "../../../../../../shared/types/location-index";

const testData: TLocationIndexData = {
  [LocIndexPropsEnum.EVENING_ENTERTAINMENT]: {
    name: "Restaurants, Bars & Clubs",
    value: 96,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  [LocIndexPropsEnum.HEALTH]: {
    name: "Medizin & Gesundheit",
    value: 85,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  [LocIndexPropsEnum.NEAR_SUPPLY]: {
    name: "Einkaufen & Nahversorgung",
    value: 97,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  [LocIndexPropsEnum.PUBLIC_TRANSPORT]: {
    name: "ÖPNV Anbindung",
    value: 98,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  [LocIndexPropsEnum.TOURISM]: {
    name: "Tourismus",
    value: 98,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  [LocIndexPropsEnum.KIDS]: {
    name: "Spielplätze & Früh-Bildung",
    value: 91,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  [LocIndexPropsEnum.CULTURE]: {
    name: "Kultur & Universitäten",
    value: 78,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  [LocIndexPropsEnum.SPORTS]: {
    name: "Sportliche Aktivitäten",
    value: 90,
    colorStyle: { backgroundColor: "#007960", opacity: 1 },
  },
  [LocIndexPropsEnum.INDIVIDUAL_MOBILITY]: {
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
