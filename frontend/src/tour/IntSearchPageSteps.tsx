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
        <h2 className="mb-5 font-bold">Willkommen beim AreaButler!</h2>
        <div>
          Auf dieser Seite lässt sich die Umgebungsanalyse für einen Standort
          mit beliebigen Kriterien durchführen.
        </div>
      </>
    ),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: (
      <>
        <p className="text-base">
          Hier können Sie den Umkreis der Suche bestimmen und einstellen, welche
          Isochronen in Ihrer Karte angezeigt werden. Die Angabe erfolgt über
          Meter oder Zeitangabe. Sie können drei Arten der Fortbewegung
          auswählen (Zu Fuß, Fahrrad und/oder Auto)
        </p>
      </>
    ),
    locale: defaultLocale,
    target: 'div[data-tour="transportation-type-WALK"]',
  },
  {
    content:
      "Hier können Sie bis zu vier wichtige Adressen hinterlegen. Diese werden in der Karte hervorgehoben. Ebenfalls steht eine Routenberechnung zu diesen wichtigen Adressen zur Verfügung.",
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
      "Fertig. Es kann losgehen und Sie können die Analyse starten oder aktualisieren.",
    locale: defaultLocale,
    placement: "top",
    target: 'button[data-tour="start-search"]',
  },
];

export default Steps;
