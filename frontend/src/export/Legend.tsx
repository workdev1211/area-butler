import { FunctionComponent } from "react";

import "./Legend.scss";
import { IPoiIcon } from "../shared/shared.types";

export interface ILegendItem {
  title: string;
  icon: IPoiIcon;
}

export interface LegendProps {
  legend: ILegendItem[];
}

export const Legend: FunctionComponent<LegendProps> = ({ legend }) => {
  return (
    <div className="legend-container">
      {legend.map(({ title, icon: { icon, color, isCustom } }) => (
        <div className="legend-item" key={`legend-item-${title}`}>
          <div
            className={`img-container ${isCustom ? "" : "default"}`}
            style={{ background: color }}
          >
            <img src={icon} alt="group-icon" />
          </div>
          {title}
        </div>
      ))}
    </div>
  );
};
