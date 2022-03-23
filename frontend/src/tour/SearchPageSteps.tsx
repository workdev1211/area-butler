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
          Auf dieser Seite lässt sich die Umgebungsanalyse für einen Standort mit beliebigen Kriterien durchführen.
        </div>
      </>
    ),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "Zeigt Ihnen die letzten gemachten Abfragen an",
    locale: defaultLocale,
    target: 'div[data-tour="last-requests"]',
  },
  {
    content:
      "Hier können Sie Ihre angelegten Objekte auswählen, um die Adresse automatisch auszufüllen",
    locale: defaultLocale,
    target: 'div[data-tour="my-real-estates"]',
  },
  {
    content: (
      <>
        <p className="text-base">
          Hier können Sie den Umkreis der Suche bestimmen und einstellen, welche Isochronen in Ihrer 
          Karte angezeigt werden. Die Angabe erfolgt über Meter oder Zeitangabe. Sie können drei Arten der 
          Fortbewegung auswählen (Zu Fuß, Fahrrad und/oder Auto)
        </p>
      </>
    ),
    locale: defaultLocale,
    target: 'div[data-tour="transportation-type-WALK"]',
  },
  {
    content:
      "Eine Vorbelegung des Bewegungsprofils und der Lokalitäten ist, wie bei Ihren Objekten, auch für Ihre Zielgruppen möglich.",
    locale: defaultLocale,
    target: 'div[data-tour="my-customers"]',
  },
  {
    content:
      "Hier können Sie bis zu vier wichtige Adressen hinterlegen. Diese werden im Ergebnis hervorgehoben. Ebenfalls steht eine Routenberechnung zu den wichtigen Adressen zur Verfügung.",
    locale: defaultLocale,
    target: 'button[data-tour="add-important-address"]',
  },
  {
    content:
      "Hier können Sie die POI Kategorien auswählen, die Sie in die Analyse und Ihre Karte mit aufnehmen möchten.",
    locale: defaultLocale,
    placement: "top",
    target: 'div[data-tour="locality-params"]',
  },
  {
    content:
      "Fertig. Es kann losgehen und sie können die Analyse starten oder aktualisieren.",
    locale: defaultLocale,
    placement: "top",
    target: 'button[data-tour="start-search"]',
  },
];

export default Steps;
