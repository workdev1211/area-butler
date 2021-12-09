import { MapClipping } from "context/SearchContext";
import { FunctionComponent, useState } from "react";

export interface SelectedMapClipping extends MapClipping {
  selected: boolean;
}

export interface MapClippingSelectionProps {
  selectedMapClippings: SelectedMapClipping[];
  setSelectedMapClippings: (
    selectedMapClippings: SelectedMapClipping[]
  ) => void;
}

const MapClippingSelection: FunctionComponent<MapClippingSelectionProps> = ({
  selectedMapClippings,
  setSelectedMapClippings
}) => {
  const onSelectionChange = (mapClipping: SelectedMapClipping) => {
    mapClipping.selected = !mapClipping.selected;
    setSelectedMapClippings([...selectedMapClippings]);
  };

  const [collapseOpen, setCollapseOpen] = useState(false);

  return (
    <div>
      <h1 className="my-5 font-bold">Bilder</h1>
      <div
        className={
          "collapse border collapse-arrow" +
          (collapseOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <div
          className="collapse-title font-medium flex items-center gap-6"
          onClick={() => setCollapseOpen(!collapseOpen)}
        >
          {selectedMapClippings.length > 0 ? (
            <span>
              Ausgewählte Bilder{" "}
              {selectedMapClippings.filter(c => c.selected).length}/
              {selectedMapClippings.length}
            </span>
          ) : (
            <span>Keine Kartenausschnitte gespeichert</span>
          )}
        </div>
        <div className="collapse-content bg-white flex flex-col">
          {selectedMapClippings.map((item: SelectedMapClipping, index) => (
            <div
              className="flex gap-5 items-center mt-10 justify-between"
              key={index}
            >
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => onSelectionChange(item)}
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
    </div>
  );
};

export default MapClippingSelection;
