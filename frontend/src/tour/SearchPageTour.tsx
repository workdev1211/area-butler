import { useState } from "react";
import Joyride, {
  CallBackProps,
  STATUS,
  Step,
  StoreHelpers,
} from "react-joyride";

const steps: Step[] = [
  {
    content: <h2>Willkommen beim Areabutler !</h2>,
    locale: {
      skip: "Abbrechen",
      next: "Weiter",
      back: "Zurück",
      last: "Beenden",
    },
    placement: "center",
    target: "body",
  },
  {
    content: "Über den aktuellen Standort lassen sich die Daten vorbelegen",
    locale: {
      skip: <span aria-label="skip">Abbrechen</span>,
      next: "Weiter",
      back: "Zurück",
      last: "Beenden",
    },
    target: ".tour_my_location_button",
  },
  {
    content:
      "Hier lässt sich die Bewegungspräferenz des Interessenten konfigurieren",
    locale: {
      skip: <span aria-label="skip">Abbrechen</span>,
      next: "Weiter",
      back: "Zurück",
      last: "Beenden",
    },
    target: ".tour_my_location_button_WALK",
  },
];

export interface SearchPageTourProps {
  runTour: boolean;
  setRunTour: (value: boolean) => void;
}

const SearchPageTour: React.FunctionComponent<SearchPageTourProps> = ({
  runTour,
  setRunTour,
}) => {
  const [helpers, setHelpers] = useState<StoreHelpers | undefined>();

  const getHelpers = (helpers: StoreHelpers) => {
    setHelpers(helpers);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      getHelpers={getHelpers}
      run={runTour}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );
};

export default SearchPageTour;
