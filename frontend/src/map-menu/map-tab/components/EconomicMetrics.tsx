import { FunctionComponent, useContext, useState } from "react";

import { setBackgroundColor } from "../../../shared/shared.functions";
import economicMetricsIcon from "../../../assets/icons/map-menu/12-wirtschaftliche-kennzahlen.svg";
import { SearchContext } from "../../../context/SearchContext";

const EconomicMetrics: FunctionComponent = () => {
  const {
    searchContextState: { responseConfig: config },
  } = useContext(SearchContext);

  const [isEconomicMetricsOpen, setIsEconomicMetricsOpen] = useState(false);

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isEconomicMetricsOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsEconomicMetricsOpen(!isEconomicMetricsOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={economicMetricsIcon} alt="economic-metrics-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">
              Wirtschaftliche Kennzahlen
            </div>
            <div className="collapse-title-text-2">
              Wie stehen die Strukturdaten?
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        <div
          className="text-justify"
          style={{
            padding:
              "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
          }}
        >
          Gerne liefern wir tiefergehende Daten zu den Themen Arbeitskräfte,
          Arbeitslosenquote, Beschäftigte nach Anforderungsniveau, BIP pro Kopf,
          Gewerbesteuereinnahmen, Logistik-Attraktivität u.v.m. Sprechen Sie uns
          hierzu einfach direkt an.
        </div>
      </div>
    </div>
  );
};

export default EconomicMetrics;
