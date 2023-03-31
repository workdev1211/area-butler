import { FunctionComponent } from "react";

import BackButton from "../../../../layout/BackButton";
import FeedbackModal from "../../../../components/FeedbackModal";
import saveIcon from "../../../../assets/icons/save.svg";
import MapMenuFooterLinks from "./MapMenuFooterLinks";
import { MapDisplayModesEnum } from "../../../../../../shared/types/types";

interface IMapMenuFooterProps {
  mapDisplayMode: MapDisplayModesEnum;
  saveConfig?: () => Promise<void>;
}

const MapMenuFooter: FunctionComponent<IMapMenuFooterProps> = ({
  mapDisplayMode,
  saveConfig = () => {},
}) => {
  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

  return (
    <div className="map-menu-footer">
      <div className="button-container">
        {isEditorMode && <BackButton key="back-button" />}
        <FeedbackModal />
        <button
          type="button"
          className="save-button"
          onClick={saveConfig}
          data-tour="save-button"
        >
          <img src={saveIcon} alt="save-icon" />
        </button>
      </div>
      <MapMenuFooterLinks />
    </div>
  );
};

export default MapMenuFooter;
