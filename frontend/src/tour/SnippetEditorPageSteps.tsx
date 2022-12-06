import { Locale, Step } from "react-joyride";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const Steps: Step[] = [
  {
    content:
      "Auf dieser Seite lassen sich die Ergebnisse der Umgebungsanalyse betrachten. Zudem können Sie die Karte an Ihre Bedürfnisse anpassen und viele Dinge exportieren.",
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "Dieser Bereich zeigt die karte genau so, wie Ihre Kunden die Karte sehen werden, sobald diese exportiert ist.",
    locale: defaultLocale,
    placement: "center",
    target: 'div[data-tour="map"]',
  },
  {
    content:
      "Hier können Sie ein- und ausblenden welche Mobilitätsart Sie betrachten wollen. Z.B. in Rot: was kann ich zu Fuß erreichen in der angegebenen Zeit",
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="map-navbar"]',
  },
  {
    content:
      "Ein Klick zoomt und zentriert die Karte auf die Erreichbarkeitslinie/Isochrone des gewählten Fortbewegungsmittels.",
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="zoom-to-bounds"]',
  },
  {
    content:
      "Hier sehen Sie eine Auflistung aller Orte, die in der Nähe sind. Die einzelnen Menüpunkte lassen sich aufklappen und die Erreichbarkeit betrachten",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="map-menu"]',
  },
  {
    content:
      "Über einen Klick auf die Adresse können Sie jederzeit bequem zurück zum Start auf der Karte navigieren",
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="reset-position"]',
  },
  {
    content: "In der Seitenleiste Sind alle Informationen für Sie gebündelt.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="map-menu"]',
  },
  {
    content:
      "Hier können Sie die aktuelle Ansicht der Karte als Bild speichern und rechts im Menü herunterladen. Die hier aufgenommenen Snapshots sind dann auch in Ihren Exporten hinterlegt.",
    locale: defaultLocale,
    placement: "right",
    target: '[data-tour="take-map-picture"]',
  },
  {
    content:
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/teRhSH2w0f4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="map-menu"]',
  },
];

export default Steps;
