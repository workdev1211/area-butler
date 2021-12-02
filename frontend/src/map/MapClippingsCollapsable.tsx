import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import { saveAs } from "file-saver";
import { useContext } from "react";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";

export interface MapClippingsCollapsableProps {
  clippings: MapClipping[];
  searchAddress: string;
}

const MapClippingsCollapsable: React.FunctionComponent<MapClippingsCollapsableProps> =
  ({ clippings, searchAddress = "Mein_Standort" }) => {
    const { searchContextDispatch } = useContext(SearchContext);

    const removeAllClippings = () => {
      window.confirm("Möchten Sie wirklich alle Kartenausschnitte löschen?") &&
        searchContextDispatch({
          type: SearchContextActionTypes.CLEAR_MAP_CLIPPINGS,
        });
    };

    const removeClipping = (c: MapClipping) => {
      window.confirm("Möchten Sie wirklich diesen Kartenausschnitt löschen?") &&
        searchContextDispatch({
          type: SearchContextActionTypes.REMOVE_MAP_CLIPPING,
          payload: c,
        });
    };

    const downloadClipping = (c: MapClipping, i: number) => {
      const underlinedAddress = searchAddress
        .replace(",", "-")
        .replace(/\s/g, "");
      saveAs(
        c.mapClippingDataUrl,
        `${underlinedAddress}-Kartenausschnitt-${i + 1}.jpeg`
      );
    };

    return (
      <div className="p-5 flex flex-col items-center gap-5">
        {clippings.map((c, i) => (
          <div className="flex items-center lg:gap-10 gap-5">
            <img
              src={c.mapClippingDataUrl}
              className="lg:w-96 w-80"
              alt="img-clipping"
            />
            <div className="flex gap-5 flex-wrap">
              <button
                className="w-6 h-6 cursor-pointer border-b-2 border-b-black"
                onClick={() => downloadClipping(c, i)}
              >
                ↓
              </button>
              <img
                src={deleteIcon}
                className="w-6 h-6 cursor-pointer"
                alt="icon-delete"
                onClick={() => removeClipping(c)}
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => removeAllClippings()}
          className="mt-5 btn btn-sm btn-secondary w-full"
        >
          Alle Löschen
        </button>
      </div>
    );
  };

export default MapClippingsCollapsable;
