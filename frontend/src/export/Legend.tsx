import { FunctionComponent } from "react";

import "./Legend.scss";
import { IPoiIcon } from "../shared/shared.types";
import LegendIcon from "./LegendIcon";

export interface ILegendItem {
  title: string;
  name: string;
  icon: IPoiIcon;
}

interface ILegendProps {
  legend: ILegendItem[];
}

export const Legend: FunctionComponent<ILegendProps> = ({ legend }) => {
  return (
    <div className="legend-container">
      {legend.map(({ title, icon }) => (
        <div className="legend-item" key={`legend-item-${title}`}>
          <LegendIcon icon={icon} />
          <div className="ml-2">{title}</div>
        </div>
      ))}
    </div>
  );
};

export default Legend;
