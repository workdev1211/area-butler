import { FunctionComponent } from "react";

import "./LegendIcon.scss";
import { IPoiIcon } from "../shared/shared.types";

interface ILegendIconProps {
  icon: IPoiIcon;
}

export const LegendIcon: FunctionComponent<ILegendIconProps> = ({
  icon: { icon, color, isCustom },
}) => {
  return (
    <div
      className={`img-container ${isCustom ? "" : "default"}`}
      style={{ background: color }}
    >
      <img src={icon} alt="group-icon" />
    </div>
  );
};

export default LegendIcon;
