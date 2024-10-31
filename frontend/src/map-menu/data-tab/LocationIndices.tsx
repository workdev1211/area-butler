import { FunctionComponent, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { setBackgroundColor } from "../../shared/shared.functions";
import locationIndicesIcon from "../../assets/icons/map-menu/11-lageindizes.svg";
import LocationIndexTable from "./data/LocationIndexTable";
import { TUnlockIntProduct } from "../../../../shared/types/integration";
import UnlockProductButton from "../components/UnlockProductButton";
import { TLocationIndexData } from "../../../../shared/types/location-index";

interface ILocationIndicesProps {
  isStatsDataAvailable: boolean;
  performUnlock: TUnlockIntProduct;
  backgroundColor: string;
  locationIndexData?: TLocationIndexData;
}

const LocationIndices: FunctionComponent<ILocationIndicesProps> = ({
  isStatsDataAvailable,
  performUnlock,
  backgroundColor,
  locationIndexData,
}) => {
  const { t } = useTranslation();
  const [isLocationIndicesOpen, setIsLocationIndicesOpen] = useState(false);

  return (
    <div
      q-id='location-indices'
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
              <span>{t(IntlKeys.snapshotEditor.positionIndices.label)}</span>{" "}
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        {isStatsDataAvailable ? (
          locationIndexData && !Object.keys(locationIndexData).length ? (
            <div
              className="text-justify"
              style={{
                padding:
                  "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
              }}
            >
              {t(IntlKeys.snapshotEditor.positionIndices.notAvailable)}
            </div>
          ) : (
            <LocationIndexTable locationIndexData={locationIndexData} />
          )
        ) : (
          <UnlockProductButton performUnlock={performUnlock} />
        )}
      </div>
    </div>
  );
};

export default LocationIndices;
