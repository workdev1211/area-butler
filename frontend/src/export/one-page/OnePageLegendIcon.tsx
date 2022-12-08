import { FunctionComponent } from "react";

import { IPoiIcon } from "../../shared/shared.types";

interface ILegendIconProps {
  icon: IPoiIcon;
}

export const OnePageLegendIcon: FunctionComponent<ILegendIconProps> = ({
  icon: { icon, color, isCustom },
}) => {
  return (
    <div
      style={{
        background: color,
        width: "26px",
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: isCustom ? 0 : "50%",
      }}
    >
      <img
        src={icon}
        alt="group-icon"
        style={{
          width: "18px",
          height: "18px",
          filter: isCustom ? "" : "brightness(0) invert(1)",
        }}
      />
    </div>
  );
};

export default OnePageLegendIcon;
