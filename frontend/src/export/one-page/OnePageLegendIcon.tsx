import { FunctionComponent } from "react";

import "./OnePageLegendIcon.scss";
import { IPoiIcon } from "../../shared/shared.types";

interface ILegendIconProps {
  icon: IPoiIcon;
}

export const OnePageLegendIcon: FunctionComponent<ILegendIconProps> = ({
  icon: { icon, color, isCustom },
}) => {
  return (
    <div
      className={`img-container ${isCustom ? "" : "default"}`}
      style={{ background: color, width: "26px", height: "26px" }}
    >
      <img
        src={icon}
        alt="group-icon"
        style={{ width: "18px", height: "18px" }}
      />
    </div>
  );
};

export default OnePageLegendIcon;
