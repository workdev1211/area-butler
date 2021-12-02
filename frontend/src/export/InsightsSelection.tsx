import React from "react";

export interface InsightsSelectionProps {
  showFederalElection: boolean;
  setShowFederalElection: (value: boolean) => void;
  showCensus: boolean;
  setShowCensus: (value: boolean) => void;
  showParticlePollution: boolean;
  setShowParticlePollution: (value: boolean) => void;
  hasCensusInSubscription: boolean;
  hasFederalElectionInSubscription: boolean;
  hasParticlePollutionInSubscription: boolean;
}

const InsightsSelection: React.FunctionComponent<InsightsSelectionProps> = ({
  showFederalElection,
  setShowFederalElection,
  showCensus,
  setShowCensus,
  showParticlePollution,
  setShowParticlePollution,
  hasCensusInSubscription,
  hasParticlePollutionInSubscription,
  hasFederalElectionInSubscription
}) => {
  return (
    <div className="mt-5">
      <h1 className="my-5 font-bold">Einblicke</h1>
      <div className="flex flex-col">
        {hasCensusInSubscription && (
          <label
            className="cursor-pointer label justify-start gap-3"
            key="census-data-checkbox-selection"
          >
            <input
              type="checkbox"
              checked={showCensus}
              className="checkbox checkbox-primary"
              onChange={() => setShowCensus(!showCensus)}
            />
            <span className="label-text">Zensus Atlas</span>
          </label>
        )}
        {hasFederalElectionInSubscription && (
          <label
            className="cursor-pointer label justify-start gap-3"
            key="federal-election-data-checkbox-selection"
          >
            <input
              type="checkbox"
              checked={showFederalElection}
              className="checkbox checkbox-primary"
              onChange={() => setShowFederalElection(!showFederalElection)}
            />
            <span className="label-text">Bundestagswahl 2021</span>
          </label>
        )}
        {hasParticlePollutionInSubscription && (
          <label
            className="cursor-pointer label justify-start gap-3"
            key="particle-pollution-data-checkbox-selection"
          >
            <input
              type="checkbox"
              checked={showParticlePollution}
              className="checkbox checkbox-primary"
              onChange={() => setShowParticlePollution(!showParticlePollution)}
            />
            <span className="label-text">Feinstaubbelastung</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default InsightsSelection;
