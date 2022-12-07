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
    content: "Hier können Sie den Vorschau-Modus aktivieren. Dieser zeigt die Karte genau so, wie Ihre KundInnen sie sehen werden.",
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="go-fullscreen"]'
  },
  {
    content:
      "Hier können Sie den aktuellen Kartenausschnitt als Bild speichern und unter Exporte herunterladen. Die hier aufgenommenen Kartenausschnitte werden auch in Ihre Dokumente integriert.",
    locale: defaultLocale,
    placement: "right",
    target: '[data-tour="take-map-picture"]',
  },
  
  {
    content: "In der Seitenleiste Sind alle Informationen für Sie gebündelt.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="side-menu"]',
  },
  {
    content: "Über die drei Tabs greifen Sie direkt auf das zu, was Sie benötigen.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="tab-icons"]',
  },
  {
    content:
      "Über einen Klick auf die Adresse zentriert die Karte wieder auf die Ausgangsposition.",
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="reset-position"]',
  },
  {
    content:
      "Hier sehen Sie alle POIs, die in der Nähe sind. Die einzelnen Menüpunkte lassen sich aufklappen, die Erreichbarkeit betrachten und einzelne POIs anklicken. Hier finden Sie auch alle weiteren Daten & Fakten, indem Sie die Hauptkategorie minimieren.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="map-menu-contents"]',
  },  
  {
    content:
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/teRhSH2w0f4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
    locale: defaultLocale,
    placement: "center",
    target: "body"]',
  },
];

export default Steps;
