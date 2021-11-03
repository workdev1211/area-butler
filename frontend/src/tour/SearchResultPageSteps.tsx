import { Step, Locale } from "react-joyride";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const Steps: Step[] = [
  {
    content: 'Auf dieser Seite lassen sich die Ergebnisse der Umgebungsanalyse betrachten',
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },  {
    content: 'Die Karte bietet eine interaktive Möglichkeit zur Bewertung des Standorts und der Umgebung in verschiedenen Zoomstufen',
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="map"]',
  },  {
    content: 'Hier sehen Sie eine Auflistung aller Orte, die in der Nähe sind. Die einzelnen Menüpunkte lassen sich aufklappen und die Errecihbarkeit betrachten',
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="map-menu"]',
  }, {
    content: 'Zur näheren Analyse stehen Ihnen weitere Daten (wie bspw. die Zensus-Daten) zur Verfügung, die Sie in der Karte ein- und ausblenden können.',
    locale: defaultLocale,
    placement: "left",
    target: 'li[data-tour="census-data-toggle"]',
  }, {
    content: 'Über einen Klick auf die Adresse können Sie jederzeit bequem zurück zum Start auf der Karte navigieren',
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="reset-position"]',
  }, {
    content: 'Über die Navigationsleiste lassen sich Ihre Objekte und die Wichtigen Adresse sowie die Bewegungsprofile ein- und ausblenden',
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="map-navbar"]',
  },  {
    content:
      "Über das Aktionen Menu lassen sich der Makler-Spickzettel und die personalisierte Umgebungsanalyse für den Interessenten mit den ausgewählten Daten exportieren.",
    locale: defaultLocale,
    target: 'div[data-tour="actions-top"]',
  },
];

export default Steps;
