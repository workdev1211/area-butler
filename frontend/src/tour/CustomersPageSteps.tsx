import { Step, Locale } from "react-joyride";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const Steps: Step[] = [
  {
    content: 'Auf dieser Seite lassen sich Ihre Interessenten/Zielgruppen verwalten.',
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "In dieser Tabelle werden Ihre Interessenten/Zielgruppen, mit allen relevanten Informationen, dargestellt.",
    locale: defaultLocale,
    target: 'div[data-tour="customers-table"]',
  },
  {
    content:
      "Über das Suche Symbol lässt sich eine neue Umgebungsanalyse starten. Die Daten des Interessenten/der Zielgruppe werden in der Suche vorbelegt.",
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-search-button-0"]',
  },
  {
    content:
      "Über das Stift Symbol lassen sich Interessenten und Zielgruppen editieren.",
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-edit-button-0"]',
  },
  {
    content:
      "Über den Papierkorb lassen sich die Interessenten oder Zielgruppen löschen.",
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-delete-button-0"]',
  },
  {
    content:
      "Über das Aktionen Menu können Sie weitere Interessenten oder Zielgruppen anlegen oder einen Fragebogen an einen neuen Interessenten per E-Mail versenden.",
    locale: defaultLocale,
    target: 'div[data-tour="actions-top"]',
  },
];


export default Steps;