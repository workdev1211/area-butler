import { act, render } from "@testing-library/react";
import MeansToggle from "./MeansToggle";
import {
  MeansOfTransportation,
  TransportationParam,
  UnitsOfTransportation
} from "../../../../../shared/types/types";

describe("MeansToggle", () => {
  const transportationParams: TransportationParam[] = [
    {
      type: MeansOfTransportation.WALK,
      unit: UnitsOfTransportation.MINUTES,
      amount: 5
    },
    {
      type: MeansOfTransportation.BICYCLE,
      unit: UnitsOfTransportation.MINUTES,
      amount: 10
    },
    {
      type: MeansOfTransportation.CAR,
      unit: UnitsOfTransportation.MINUTES,
      amount: 10
    }
  ];

  const availableMeans: MeansOfTransportation[] = [
    MeansOfTransportation.WALK,
    MeansOfTransportation.BICYCLE,
    MeansOfTransportation.CAR
  ];

  const activeMeans: MeansOfTransportation[] = [
    MeansOfTransportation.WALK,
    MeansOfTransportation.BICYCLE
  ];

  test("should mount", async () => {
    const onMeansChange = jest.fn();
    const component = render(
      <MeansToggle
        transportationParams={transportationParams}
        availableMeans={availableMeans}
        activeMeans={activeMeans}
        onMeansChange={onMeansChange}
        hideIsochrones={false}
      />
    );
    expect(component).toBeDefined();
  });

  test("should render toggles for means", async () => {
    const onMeansChange = jest.fn();
    const allMeansComponent = render(
      <MeansToggle
        transportationParams={transportationParams}
        availableMeans={availableMeans}
        activeMeans={activeMeans}
        onMeansChange={onMeansChange}
        hideIsochrones={false}
      />
    );
    const buttonsAll = allMeansComponent.container.querySelectorAll("button");
    expect(buttonsAll.length).toEqual(3);

    const twoMeansComponent = render(
      <MeansToggle
        transportationParams={transportationParams}
        availableMeans={availableMeans.filter(
          m => m !== MeansOfTransportation.BICYCLE
        )}
        activeMeans={activeMeans}
        onMeansChange={onMeansChange}
        hideIsochrones={false}
      />
    );
    const buttonsTwo = twoMeansComponent.container.querySelectorAll("button");
    expect(buttonsTwo.length).toEqual(2);
  });

  test("should have initial active state", async () => {
    const onMeansChange = jest.fn();
    const { getByTestId } = render(
      <MeansToggle
        transportationParams={transportationParams}
        availableMeans={availableMeans}
        activeMeans={activeMeans}
        onMeansChange={onMeansChange}
        hideIsochrones={false}
      />
    );
    const walkToggle = getByTestId(
      `means-toggle-${MeansOfTransportation.WALK}`
    );
    expect(walkToggle).toBeDefined();
    expect(walkToggle.className).toContain("active");
    const bicycleToggle = getByTestId(
      `means-toggle-${MeansOfTransportation.BICYCLE}`
    );
    expect(bicycleToggle).toBeDefined();
    expect(bicycleToggle.className).toContain("active");
    const carToggle = getByTestId(`means-toggle-${MeansOfTransportation.CAR}`);
    expect(carToggle).toBeDefined();
    expect(carToggle.className).not.toContain("active");
  });

  test("should change active state", async () => {
    const onMeansChange = jest.fn();
    const { getByTestId } = render(
      <MeansToggle
        transportationParams={transportationParams}
        availableMeans={availableMeans}
        activeMeans={activeMeans}
        onMeansChange={onMeansChange}
        hideIsochrones={false}
      />
    );
    const bicycleToggle = getByTestId(
      `means-toggle-${MeansOfTransportation.BICYCLE}`
    );
    const carToggle = getByTestId(`means-toggle-${MeansOfTransportation.CAR}`);
    act(() => {
      bicycleToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onMeansChange).toHaveBeenCalledTimes(1);
    expect(onMeansChange).toHaveBeenCalledWith([MeansOfTransportation.WALK]);
    act(() => {
      carToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onMeansChange).toHaveBeenCalledTimes(2);
    expect(onMeansChange).toHaveBeenCalledWith([
      MeansOfTransportation.WALK,
      MeansOfTransportation.BICYCLE,
      MeansOfTransportation.CAR
    ]);
  });
});
