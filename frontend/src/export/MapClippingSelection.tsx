import { FunctionComponent, useState } from "react";

import { MapClipping } from "context/SearchContext";
import { toastError } from "../shared/shared.functions";

export interface ISelectableMapClipping extends MapClipping {
  selected: boolean;
}

interface IMapClippingSelectionProps {
  selectableMapClippings: ISelectableMapClipping[];
  setSelectableMapClippings: (
    selectedMapClippings: ISelectableMapClipping[]
  ) => void;
  limit?: number;
}

const MapClippingSelection: FunctionComponent<IMapClippingSelectionProps> = ({
  selectableMapClippings,
  setSelectableMapClippings,
  limit,
}) => {
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

  const [collapseOpen, setCollapseOpen] = useState(false);

  return (
    <div
      className={
        "collapse border collapse-arrow" +
        (collapseOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title font-medium flex items-center gap-6"
        onClick={() => {
          setCollapseOpen(!collapseOpen);
        }}
      >
        {selectableMapClippings.length > 0 ? (
          <span>
            Ausgewählte Bilder{" "}
            {selectableMapClippings.filter((c) => c.selected).length} /{" "}
            {limit
              ? `${limit} (${selectableMapClippings.length})`
              : selectableMapClippings.length}
          </span>
        ) : (
          <span>Keine Kartenausschnitte gespeichert</span>
        )}
      </div>
      <div className="collapse-content bg-white flex flex-col">
        {selectableMapClippings.map((item: ISelectableMapClipping, index) => (
          <div
            className="flex gap-5 items-center mt-10 justify-between"
            key={index}
          >
            <input
              type="checkbox"
              checked={item.selected}
              onChange={() => {
                onSelectionChange(item);
              }}
              className="checkbox checkbox-primary"
            />
            <img
              src={item.mapClippingDataUrl}
              className="w-80"
              alt="img-clipping"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapClippingSelection;
