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
      "Umgebung analysieren, Karte anpassen, Dokumente exportieren. Es gibt viel zu entdecken. Los gehts mit der Tour...",
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "Filter über die Mobilitätsarten. Hier können Sie ein- und ausblenden was Sie betrachten wollen. Z.B. in rot: was kann ich zu Fuß erreichen in der angegebenen Zeit",
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="map-navbar"]',
  },
  {
    content:
      "Hier können Sie die Erreichbarkeitslinie/Isochrone aus- und einblenden",
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="toggle-bounds"]',
  },
  {
    content:
      "Auto-Zoom, zentriert die Karte auf die jeweilige Erreichbarkeitslinie/Isochrone.",
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="zoom-to-bounds"]',
  },
  {
    content: "Vorschau-Modus aktivieren. Dieser zeigt die Karte genau so, wie Ihre KundInnen sie sehen werden, in einem neuen Tab.",
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="go-fullscreen"]'
  },
  {
    content:
      "Kartenausschnitte erstellen: Hier können Sie den aktuellen Kartenausschnitt als Bild speichern und unter Exporte herunterladen. Diese Bilder werden auch in die Export-Dokumente integriert.",
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="take-map-picture"]',
  },
  {
    content: "Seitenleiste: In dieser sind alle Informationen & Aktionen für Sie erreichbar.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="side-menu"]',
  },
  {
    content: "Tabs: greifen Sie direkt auf das zu, was Sie benötigen. Mit dem Button ganz rechts können Sie die Seitenleiste ein- oder ausblende z.B. um Kartenausschnitte aufzunehmen.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="tab-icons"]',
  },
  {
    content: "Mehr Durchblick: Hier können Sie die Seitenleiste ein- oder ausblende um z.B. Kartenausschnitte aufzunehmen.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="ShowMapMenuButton"]',
  },
  {
    content:
      "Karte zentrieren: Über einen Klick auf die Adresse wieder zur Ausgangsposition.",
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="reset-position"]',
  },
  {
    content:
      "Lokalitäten, Indizes, Daten: Die einzelnen Menüpunkte lassen sich aufklappen, die Erreichbarkeit betrachten und einzelne POIs anklicken. Hier finden Sie auch alle weiteren Daten & Fakten, indem Sie die Hauptkategorie minimieren.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="map-menu-contents"]',
  },  
  {
    content:
      "Änderungen an Ihrer Karte speichern & veröffentlichen.",
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="save-button"]',
  },
  {
    content:
      "<iframe width="560" height="315" src="https://www.youtube.com/embed/teRhSH2w0f4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>",
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
];

export default Steps;
