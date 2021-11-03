import { Step, Locale } from "react-joyride";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const Steps: Step[] = [
  {
    content: 'Auf dieser Seite lassen sich Ihre Objekte verwalten',
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "In dieser Tabelle werden Ihre Objekte dargestellt mit allen relevanten Informationen",
    locale: defaultLocale,
    target: 'div[data-tour="real-estates-table"]',
  },
  {
    content:
      "Über das Suche Symbol lässt sich eine neue Umgebungsanalyse starten. Die Daten des Objektes werden in der Suche vorbelegt",
    locale: defaultLocale,
    target: 'img[data-tour="real-estates-table-item-search-button-0"]',
  },
  {
    content:
      "Über das Stift Symbol lassen sich Objekte editieren",
    locale: defaultLocale,
    target: 'img[data-tour="real-estates-table-item-edit-button-0"]',
  },
  {
    content:
      "Über den Papierkorb lassen sich die Objekte löschen",
    locale: defaultLocale,
    target: 'img[data-tour="real-estates-table-item-delete-button-0"]',
  },
  {
    content:
      "Über das Aktionen Menu lassen sich weitere Objekte anlegen",
    locale: defaultLocale,
    target: 'div[data-tour="actions-top"]',
  },

];


export default Steps;