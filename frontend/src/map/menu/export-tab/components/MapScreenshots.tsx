import { FunctionComponent, useContext, useState } from "react";

import { setBackgroundColor } from "../../../../shared/shared.functions";
import mapScreenshotsIcon from "../../../../assets/icons/map-menu/07-kartenausschnitte.svg";
import MapClippingsCollapsable from "../../components/MapClippingsCollapsable";
import { SearchContext } from "../../../../context/SearchContext";

interface IMapScreenshotsProps {
  searchAddress: string;
  backgroundColor: string;
}

const MapScreenshots: FunctionComponent<IMapScreenshotsProps> = ({
  searchAddress,
  backgroundColor,
}) => {
  const {
    searchContextState: { mapClippings },
  } = useContext(SearchContext);

  const [isMapScreenshotsOpen, setIsMapScreenshotsOpen] = useState(false);

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isMapScreenshotsOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsMapScreenshotsOpen(!isMapScreenshotsOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={mapScreenshotsIcon} alt="map-screenshots-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">Kartenausschnitte</div>
            <div className="collapse-title-text-2">
              Für Exposés, Print Medien, Bildergalerien
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        {mapClippings.length > 0 ? (
          <MapClippingsCollapsable
            searchAddress={searchAddress}
            clippings={mapClippings}
          />
        ) : (
          <div
            className="text-justify"
            style={{
              padding:
                "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
            }}
          >
            Bitte verwenden Sie den Screenshot-Button in der unteren linken Ecke
            der Karte.
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreenshots;
