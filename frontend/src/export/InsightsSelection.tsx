export interface InsightsSelectionProps {
  showFederalElection: boolean;
  setShowFederalElection: (value: boolean) => void;
  showCensus: boolean;
  setShowCensus: (value: boolean) => void;
  showParticlePollution: boolean;
  setShowParticlePollution: (value: boolean) => void;
}

const InsightsSelectionProps: React.FunctionComponent<InsightsSelectionProps> =
  ({
    showFederalElection,
    setShowFederalElection,
    showCensus,
    setShowCensus,
    showParticlePollution,
    setShowParticlePollution,
  }) => {
    return (
      <div className="mt-5">
        <h1 className="my-5 font-bold">Einblicke</h1>
        <div className="flex flex-col">
          <label
            className="cursor-pointer label justify-start gap-3"
            key="census-data-checkbox-selection"
          >
            <input
              type="checkbox"
              checked={showCensus}
              className="checkbox checkbox-primary"
              onChange={(e) => setShowCensus(!showCensus)}
            />
            <span className="label-text">Zensus Atlas</span>
          </label>
          <label
            className="cursor-pointer label justify-start gap-3"
            key="federal-election-data-checkbox-selection"
          >
            <input
              type="checkbox"
              checked={showFederalElection}
              className="checkbox checkbox-primary"
              onChange={(e) => setShowFederalElection(!showFederalElection)}
            />
            <span className="label-text">Bundestagswahl 2021</span>
          </label>
          <label
            className="cursor-pointer label justify-start gap-3"
            key="particle-pollution-data-checkbox-selection"
          >
            <input
              type="checkbox"
              checked={showParticlePollution}
              className="checkbox checkbox-primary"
              onChange={(e) => setShowParticlePollution(!showParticlePollution)}
            />
            <span className="label-text">Feinstaubbelastung</span>
          </label>
        </div>
      </div>
    );
  };

export default InsightsSelectionProps;
