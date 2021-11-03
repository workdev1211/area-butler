import { Step, Locale } from "react-joyride";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const Steps: Step[] = [
  {
    content: (
      <>
        <h2 className="mb-5 font-bold">Willkommen beim Areabutler!</h2>
        <div>
          Auf dieser Seite lässt sich die Umgebungsanalyse für einen
          Interessenten durchführen
        </div>
      </>
    ),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "Über Meine Objekte lassen sich hinzugefügte Objekte in der Suche als Adresse vorbelegen",
    locale: defaultLocale,
    target: 'div[data-tour="my-real-estates"]',
  },
  {
    content:
      "Alternativ lässt sich der aktuelle Standort als Adresse über die aktivierten Standortdienste vorbelegen",
    locale: defaultLocale,
    target: 'button[data-tour="my-location"]',
  },
  {
    content: (
      <>
        <p className="text-base">
          Über die Bewegungspräferenz lässt sich der Umkreis der Suche
          bestimmen. Die Angabe erfolgt über Meter oder Zeitangabe. Zur besseren
          Einordnung lassen sich drei Bewegungsprofile auswählen (Zu Fuß, Mit
          Fahrrad und/oder mit Auto)
        </p>
      </>
    ),
    locale: defaultLocale,
    target: 'div[data-tour="transportation-type-WALK"]',
  },
  {
    content:
      "Über Adresse hinzufügen lassen sich bis zu vier wichtige Adressen eines Interessenten hinterlegen, die im Ergebnis später hervorgehoben werden. Ebenfalls steht eine Routenberechnung zu den Adressen zur Verfügung.",
    locale: defaultLocale,
    target: 'button[data-tour="add-important-address"]',
  },
  {
    content:
      "Eine Vorbelegung des Bewegungsprofils und der Lokalitäten ist wie bei den Objekten auch für hinterlegte Interessenten möglich",
    locale: defaultLocale,
    target: 'div[data-tour="my-customers"]',
  },
  {
    content:
      "Über die Lokalitäten lassen sich die bevorzugten Orte vorauswählen",
    locale: defaultLocale,
    placement: "top",
    target: 'div[data-tour="locality-params"]',
  },
  {
    content:
      "Wenn alle Daten eingegeben sind, kann es losgehen und die Suche gestartet werden.",
    locale: defaultLocale,
    placement: "top",
    target: 'button[data-tour="start-search"]',
  },
];

export default Steps;
