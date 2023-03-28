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
      "Auf dieser Seite lassen sich die Ergebnisse der Umgebungsanalyse betrachten",
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "Die Karte bietet eine interaktive Möglichkeit zur Bewertung des Standorts und der Umgebung in verschiedenen Zoomstufen",
    locale: defaultLocale,
    placement: "top-start",
    target: 'div[data-tour="map"]',
  },
  {
    content:
      "Hier sehen Sie eine Auflistung aller Orte, die in der Nähe sind. Die einzelnen Menüpunkte lassen sich aufklappen und die Erreichbarkeit betrachten",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="side-menu"]',
  },
  {
    content:
      "Über einen Klick auf die Adresse können Sie jederzeit bequem zurück zum Start auf der Karte navigieren",
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="reset-position"]',
  },
  {
    content:
      "Hier können Sie ein- und ausblenden welche Mobilitätsart Sie betrachten wollen. Zb. in Rot: was kann ich zu Fuß erreichen in der angegebenen Zeit",
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
    content: "Hier können Sie den Vollbildmodus aktivieren bzw. deaktivieren.",
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="go-fullscreen"]',
  },
  {
    content:
      "Hier können Sie die aktuelle Ansicht der Karte als Bild speichern und rechts im Menü herunterladen. Die hier aufgenommenen Snapshots sind dann auch in Ihren Exporten hinterlegt.",
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="take-map-picture"]',
  },
];

export default Steps;
