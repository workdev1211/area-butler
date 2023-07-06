import { FunctionComponent } from "react";
import { ReactSortable } from "react-sortablejs";

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
        if (mapClipping.isSelected) {
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
      !mapClipping.isSelected
    ) {
      toastError("Es wurden zu viele Gruppen ausgewählt!");
      return;
    }

    mapClipping.isSelected = !mapClipping.isSelected;
    setSelectableMapClippings([...selectableMapClippings]);
  };

  return (
    <div>
      {selectableMapClippings.length > 0 ? (
        <div>
          Ausgewählte Kartenausschnitte{" "}
          {selectableMapClippings.filter((c) => c.isSelected).length}/
          {limit || selectableMapClippings.length}
        </div>
      ) : (
        <div>Keine Kartenausschnitte gespeichert</div>
      )}

      <ReactSortable
        list={selectableMapClippings}
        setList={setSelectableMapClippings}
      >
        {selectableMapClippings.map((mapClipping: ISelectableMapClipping) => (
          // Change key to array index and check the behavior with more than 2 screenshots
          // Check the 'selectableMapClippings' output array, there will be only 2 active screenshots as intended
          <div className="flex gap-5 items-center mt-5" key={mapClipping.id}>
            <input
              type="checkbox"
              checked={mapClipping.isSelected}
              onChange={() => {
                onSelectionChange(mapClipping);
              }}
              className="checkbox checkbox-primary"
            />
            <img
              className="w-auto h-32"
              src={mapClipping.mapClippingDataUrl}
              alt="img-clipping"
            />
          </div>
        ))}
      </ReactSortable>
    </div>
  );
};

export default OnePageMapClippingSelection;
