import { FunctionComponent } from "react";

import "./Legend.scss";

export interface ILegendItem {
  title: string;
  icon: { icon: string; color: string };
}

export interface LegendProps {
  legend: ILegendItem[];
}

export const Legend: FunctionComponent<LegendProps> = ({ legend }) => {
  return (
    <div className="legend-container">
      {legend.map((legendItem) => (
        <div className="legend-item" key={`legend-item-${legendItem.title}`}>
          <div
            className="img-container"
            style={{ background: legendItem.icon.color }}
          >
            <img src={legendItem.icon.icon} alt="group-icon" />
          </div>
          {legendItem.title}
        </div>
      ))}
    </div>
  );
};
