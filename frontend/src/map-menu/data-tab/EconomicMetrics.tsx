import { FunctionComponent, useContext, useState } from "react";

import { IntlKeys } from "i18n/keys";
import { useTranslation } from "react-i18next";

import { setBackgroundColor } from "../../shared/shared.functions";
import economicMetricsIcon from "../../assets/icons/map-menu/12-wirtschaftliche-kennzahlen.svg";
import { SearchContext } from "../../context/SearchContext";

const EconomicMetrics: FunctionComponent = () => {
  const { t } = useTranslation();
  const {
    searchContextState: { responseConfig: config },
  } = useContext(SearchContext);

  const [isEconomicMetricsOpen, setIsEconomicMetricsOpen] = useState(false);

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  return (
    <div
      q-id='economics-metric'
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
              {t(IntlKeys.snapshotEditor.economicMetric.label)}
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
          {t(IntlKeys.snapshotEditor.economicMetric.contactUs)}
        </div>
      </div>
    </div>
  );
};

export default EconomicMetrics;
