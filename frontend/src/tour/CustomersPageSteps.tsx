import { Step, Locale } from "react-joyride";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const Steps: Step[] = [
  {
    content: 'Auf dieser Seite lassen sich Ihre Interessenten verwalten.',
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "In dieser Tabelle werden Ihre Interessenten dargestellt mit allen relevanten Informationen.",
    locale: defaultLocale,
    target: 'div[data-tour="customers-table"]',
  },
  {
    content:
      "Über das Suche Symbol lässt sich eine neue Umgebungsanalyse starten. Die Daten des Interessenten werden in der Suche vorbelegt.",
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-search-button-0"]',
  },
  {
    content:
      "Über das Stift Symbol lassen sich Interessenten editieren.",
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-edit-button-0"]',
  },
  {
    content:
      "Über den Papierkorb lassen sich die Interessenten löschen.",
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-delete-button-0"]',
  },
  {
    content:
      "Über das Aktionen Menu lassen sich weitere Interessenten anlegen oder einen Fragebogen an einen neuen Interessenten versenden.",
    locale: defaultLocale,
    target: 'div[data-tour="actions-top"]',
  },
];


export default Steps;