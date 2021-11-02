import { useState } from "react";
import Joyride, {
  Locale,
  CallBackProps,
  STATUS,
  Step,
  StoreHelpers,
  Styles,
} from "react-joyride";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const defaultStyles: Styles = {
  options: {
    zIndex: 10000,
    primaryColor: "#c91444",
  },
  spotlight: {
    backgroundColor: 'white',
  },
  overlay: {
    mixBlendMode: 'darken'
  }
};

const steps: Step[] = [
  {
    content: <><h2 className="mb-5 font-bold">Willkommen beim Areabutler!</h2><div>Auf dieser Seite lässt sich die Umgebungsanalyse für einen Interessenten durchführen</div></>,
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: "Über Meine Objekte lassen sich hinzugefügte Objekte in der Suche als Adresse vorbelegen",
    locale: defaultLocale,
    target: 'div[data-tour="my-real-estates"]',
  },
  {
    content: "Alternativ lässt sich der aktuelle Standort als Adresse über die aktivierten Standortdienste vorbelegen",
    locale: defaultLocale,
    target: 'button[data-tour="my-location"]',
  },
  {
    content: (
      <>
        <p className="text-base">
          Über die Bewegungspräferenz lässt sich der Umkreis der Suche bestimmen. Die Angabe erfolgt über Meter oder Zeitangabe. 
          Zur besseren Einordnung lassen sich drei Bewegungsprofile auswählen (Zu Fuß, Mit Fahrrad und/oder mit Auto)
        </p>
      </>
    ),
    locale: defaultLocale,
    target: 'div[data-tour="transportation-type-WALK"]',
  },
  {
    content: "Über Adresse hinuzufügen lassen sich bis zu vier wichtige Adressen eines Interessenten hinterlegen, die im Ergebnis später hervorgehoben werden. Ebenfalls steht eine Routenberechnung zu den Adressen zur Verfügung.",
    locale: defaultLocale,
    target: 'button[data-tour="add-important-address"]',
  },
  {
    content: "Eine Vorbelegung des Bewegungsprofils und der Lokalitäten ist wie bei den Objekten auch für hinterlegte Interessenten möglich",
    locale: defaultLocale,
    target: 'div[data-tour="my-customers"]',
  },  
  {
    content: "Über die Lokalitäten lassen sich die bevorzugten Orte vorauswählen",
    locale: defaultLocale,
    placement: 'top',
    target: 'div[data-tour="locality-params"]',
  },
  {
    content: "Wenn alle Daten eingegeben sind, kann es losgehen und die Suche gestartet werden.",
    locale: defaultLocale,
    placement: 'top',
    target: 'button[data-tour="start-search"]',
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
      styles={{ ...defaultStyles }}
    />
  );
};

export default SearchPageTour;
