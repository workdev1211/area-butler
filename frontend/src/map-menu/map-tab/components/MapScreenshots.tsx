import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { setBackgroundColor } from "../../../shared/shared.functions";
import mapScreenshotsIcon from "../../../assets/icons/map-menu/07-kartenausschnitte.svg";
import MapClippingsCollapsable from "../../components/MapClippingsCollapsable";
import { SearchContext } from "../../../context/SearchContext";
import { IntlKeys } from "../../../i18n/keys";

interface IMapScreenshotsProps {
  searchAddress: string;
  backgroundColor: string;
}

const MapScreenshots: FC<IMapScreenshotsProps> = ({
  searchAddress,
  backgroundColor,
}) => {
  const {
    searchContextState: { mapClippings },
  } = useContext(SearchContext);
  const { t } = useTranslation();

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
            <div className="collapse-title-text-1">
              {t(IntlKeys.snapshotEditor.dataTab.mapSection)}
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
            {t(IntlKeys.snapshotEditor.dataTab.useScreenshotBtn)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreenshots;
