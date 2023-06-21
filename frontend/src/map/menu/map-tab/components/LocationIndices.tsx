import { FunctionComponent, useState } from "react";

import { setBackgroundColor } from "../../../../shared/shared.functions";
import locationIndicesIcon from "../../../../assets/icons/map-menu/11-lageindizes.svg";
import { TLocationIndexData } from "../../../../hooks/locationindexdata";
import LocationIndexTable from "./data/LocationIndexTable";
import UnlockProduct from "../../components/UnlockProduct";
import { TUnlockIntProduct } from "../../../../../../shared/types/integration";

interface ILocationIndicesProps {
  isStatsExportActive: boolean;
  performUnlock: TUnlockIntProduct;
  backgroundColor: string;
  locationIndexData?: TLocationIndexData;
}

const LocationIndices: FunctionComponent<ILocationIndicesProps> = ({
  isStatsExportActive,
  performUnlock,
  backgroundColor,
  locationIndexData,
}) => {
  const [isLocationIndicesOpen, setIsLocationIndicesOpen] = useState(false);

  return (
    <div
      className={`collapse collapse-arrow view-option${
        isLocationIndicesOpen ? " collapse-open" : " collapse-closed"
      }`}
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsLocationIndicesOpen(!isLocationIndicesOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={locationIndicesIcon} alt="location-indices-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1 flex gap-2">
              <span>Lageindizes</span>{" "}
              <span
                className={`badge ${
                  isLocationIndicesOpen ? "badge-accent" : "badge-primary"
                }`}
              >
                NEU
              </span>
            </div>
            <div className="collapse-title-text-2">
              Die Nachbarschaft im Vergleich?
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        {isStatsExportActive ? (
          locationIndexData && !Object.keys(locationIndexData).length ? (
            <div
              className="text-justify"
              style={{
                padding:
                  "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
              }}
            >
              Lageindizes sind nicht verfügbar.
            </div>
          ) : (
            <LocationIndexTable locationIndexData={locationIndexData} />
          )
        ) : (
          <UnlockProduct performUnlock={performUnlock} />
        )}
      </div>
    </div>
  );
};

export default LocationIndices;
