import { Locale, Step } from "react-joyride";

import { defaultStyles } from "./TourStarter";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const Steps: Step[] = [
  {
    content: (
      <div className="text-justify">
        Umgebung analysieren, Karte anpassen, Dokumente exportieren. Es gibt
        viel zu entdecken. Los gehts mit der Tour...
      </div>
    ),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: (
      <div className="text-justify">
        Filter: Hier können Sie ein- und ausblenden welche Mobilitätsart Sie
        betrachten wollen. Z.B. in rot: was kann ich zu Fuß erreichen in der
        angegebenen Zeit
      </div>
    ),
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="map-navbar"]',
  },
  {
    content: (
      <div className="text-justify">
        Hier können Sie die Erreichbarkeitslinie / Isochrone aus- und einblenden
      </div>
    ),
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="toggle-bounds"]',
  },
  {
    content: (
      <div className="text-justify">
        Auto-Zoom: Zentriert die Karte auf die jeweilige
        Erreichbarkeitslinie / Isochrone.
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="zoom-to-bounds"]',
  },
  {
    content: (
      <div className="text-justify">
        Vorschau: Zeigt die Karte in einem neuen Tab genau so, wie Ihre
        KundInnen sie sehen werden.
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="go-fullscreen"]',
  },
  {
    content: (
      <div className="text-justify">
        Kartenausschnitte: Erstellen Sie hier den aktuellen Kartenausschnitt als
        Bild. Sie können Ihn unter Exporte herunterladen. Diese Bilder werden
        auch in die Export-Dokumente integriert.
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="take-map-picture"]',
  },
  {
    content: (
      <div className="text-justify">
        Seitenleiste: In dieser sind alle Informationen & Aktionen für Sie
        erreichbar.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="side-menu"]',
  },
  {
    content: (
      <div className="text-justify">
        Tabs: greifen Sie direkt auf das zu, was Sie benötigen. Mit dem Button
        ganz rechts können Sie die Seitenleiste ein- oder ausblende z.B. um
        Kartenausschnitte aufzunehmen.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="tab-icons"]',
  },
  {
    content: (
      <div className="text-justify">
        Durchblick: Hier können Sie die Seitenleiste ein- oder ausblenden z.B.
        um Kartenausschnitte aufzunehmen.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="ShowMapMenuButton"]',
  },
  {
    content: (
      <div className="text-justify">
        Karte zentrieren: Über einen Klick auf die Adresse wieder zur
        Ausgangsposition.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="reset-position"]',
  },
  {
    content: (
      <div className="text-justify">
        Lokalitäten, Indizes, Daten: Die einzelnen Menüpunkte lassen sich aus-
        und einklappen, die Erreichbarkeit betrachten und einzelne POIs
        anklicken. Hier finden Sie auch alle weiteren Daten & Fakten, indem Sie
        die Hauptkategorie minimieren.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="map-menu-contents"]',
  },
  {
    content: (
      <div className="text-justify">
        Speichern: Änderungen an Ihrer Karte speichern & veröffentlichen.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="save-button"]',
  },
  {
    content: (
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/teRhSH2w0f4"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
      />
    ),
    locale: defaultLocale,
    placement: "center",
    target: "body",
    styles: {
      ...defaultStyles,
      options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
    },
  },
];

export default Steps;
