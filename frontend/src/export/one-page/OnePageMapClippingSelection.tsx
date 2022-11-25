import { FunctionComponent } from "react";

import { toastError } from "../../shared/shared.functions";
import { ISelectableMapClipping } from "../MapClippingSelection";

interface IOnePageMapClippingSelectionProps {
  selectableMapClippings: ISelectableMapClipping[];
  setSelectableMapClippings: (
    selectedMapClippings: ISelectableMapClipping[]
  ) => void;
  limit?: number;
}

const OnePageMapClippingSelection: FunctionComponent<
  IOnePageMapClippingSelectionProps
> = ({ selectableMapClippings, setSelectableMapClippings, limit }) => {
  const onSelectionChange = (mapClipping: ISelectableMapClipping): void => {
    const selectedMapClippingsCount = selectableMapClippings.reduce(
      (result, mapClipping) => {
        if (mapClipping.selected) {
          result += 1;
        }

        return result;
      },
      0
    );

    if (
      limit &&
      (selectedMapClippingsCount > limit ||
        selectedMapClippingsCount === limit) &&
      !mapClipping.selected
    ) {
      toastError("Es wurden zu viele Gruppen ausgewählt!");
      return;
    }

    mapClipping.selected = !mapClipping.selected;
    setSelectableMapClippings([...selectableMapClippings]);
  };

  return (
    <div>
      {selectableMapClippings.length > 0 ? (
        <div>
          Ausgewählte Kartenausschnitte{" "}
          {selectableMapClippings.filter((c) => c.selected).length}/
          {limit || selectableMapClippings.length}
        </div>
      ) : (
        <div>Keine Kartenausschnitte gespeichert</div>
      )}
      {selectableMapClippings.map((item: ISelectableMapClipping, index) => (
        <div className="flex gap-5 items-center mt-5" key={index}>
          <input
            type="checkbox"
            checked={item.selected}
            onChange={() => {
              onSelectionChange(item);
            }}
            className="checkbox checkbox-primary"
          />
          <img
            className="w-96"
            src={item.mapClippingDataUrl}
            alt="img-clipping"
          />
        </div>
      ))}
    </div>
  );
};

export default OnePageMapClippingSelection;
