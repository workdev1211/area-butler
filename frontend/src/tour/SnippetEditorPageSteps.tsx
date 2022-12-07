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
        Umgebung analysieren, Karte anpassen, Dokumente & Links exportieren. Es gibt
        viel zu entdecken und dafür gibts hier Tipps, Tricks und kurze Erklärvideos ...
      </div>
    ),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: (
      <div className="text-justify">
        Hier können Sie filtern, welches Erreichbarkeitsgebiet Sie
        betrachten wollen z.B. in rot: was kann man, in der angegebenen Zeit, zu Fuß erreichen.
      </div>
    ),
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="map-navbar"]',
  },
  {
    content: (
      <div className="text-justify">
        Keine Lust auf zackige Linien im Kartenausschnitt? Hier können Sie die Erreichbarkeitslinien aus- und einblenden aber trotzdem die POIs in der Karte behalten.
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="toggle-bounds"]',
  },
  {
    content: (
      <div className="text-justify">
        Auto-Zoom: Zoomt und zentriert die Karte auf das jeweilige Erreichbarkeitsgebiet.
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="zoom-to-bounds"]',
  },
  {
    content: (
      <div className="text-justify">
        Vorschau: Zeigt die Karte in einem neuen Vorschau-Tab genau so, wie Ihre KundInnen diese sehen werden.
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="go-fullscreen"]',
  },
  {
    content: (
      <div className="text-justify">
        Erstellen Sie hier den aktuellen Kartenausschnitt als Bild. Sie können die Bilder unter Exporte herunterladen. Sie werden auch in Ihre Export-Dokumente integriert. Tipp: Verändern Sie die Größe Ihres Browserfensters für das perfekte Seitenverhältnis, für Ihren Anwendungsfall.
      </div>
    ),
    locale: defaultLocale,
    placement: "top",
    target: 'a[data-tour="take-map-picture"]',
  },
  {
        content: (
          <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/Rr_UkT-sjO4?start=16" 
          title="Neue Seitenleiste" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen={true}
        />
        ),
        locale: defaultLocale,
        placement: "left",
        target: 'div[data-tour="side-menu"]',
        styles: {
          ...defaultStyles,
          options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
        },
      },
  {
    content: (
      <div className="text-justify">
        Tabs: greifen Sie direkt auf das zu, was Sie benötigen. Hier zu jedem Tab ein kurzes Erklärvideo.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="tab-icons"]',
  },

{
        content: (
          <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/teRhSH2w0f4?start=7" 
          title="Karte" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen={true}
        />
        ),
        locale: defaultLocale,
        placement: "bottom",
        target: 'div[data-tour="icon-karte"]',
        styles: {
          ...defaultStyles,
          options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
        },
      },
{
        content: (
          <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/YxWCTLl_NrA?start=7" 
          title="Editor" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen={true}
        />
        ),
        locale: defaultLocale,
        placement: "bottom",
        target: 'div[data-tour="icon-editor"]',
        styles: {
          ...defaultStyles,
          options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
        },
      },
{
        content: (
          <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/_qpY8uBWsD8?start=7" 
          title="Exporte" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen={true}
        />
        ),
        locale: defaultLocale,
        placement: "bottom",
        target: 'div[data-tour="icon-exporte"]',
        styles: {
          ...defaultStyles,
          options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
        },
      },
  {
    content: (
      <div className="text-justify">
        Hier können Sie die Seitenleiste ein- oder ausblenden z.B. um Kartenausschnitte aufzunehmen.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="ShowMapMenuButton"]',
  },
  {
    content: (
      <div className="text-justify">
        Über einen Klick auf die Adresse gelangen Sie wieder zur zentrierten Ausgangsposition.
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="reset-position"]',
  },
  {
    content: (
      <div className="text-justify">
        Lokalitäten, Indizes, Daten: Die einzelnen Kategorien lassen sich aus- und einklappen und einzelne POIs anklicken und in der Karte hervorheben. Hier finden Sie auch  weitere Daten & Fakten.
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
    placement: "top",
    target: 'button[data-tour="save-button"]',
  },
];

export default Steps;
