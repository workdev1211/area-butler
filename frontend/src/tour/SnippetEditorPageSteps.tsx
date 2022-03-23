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
      "In Ihrem Karteneditor können Sie die Karte an Ihre Wünsche, Farben, Stile anzupassen und z.B. auf Ihrer Webseite zu veröffentlichen.",
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "Dies ist der Vorschaubereich und zeigt Ihre Karte in Ihrer aktuellen Konfiguration. Genau, wie Ihre Kunden die Karte sehen werden, sobald diese veröffentlicht ist.",
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="map"]',
  },  {
    content:
      "Hier lässt sich die Karte an Ihre Anforderungen anpassen.",
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="editor-map-menu"]',
  },
  {
    content:
      'Hier können Sie die Karte veröffentlichen. Für sie wird ein iFrame/Snippet HTML code erstellt den Sie auf ihre Webseite kopieren können. Zudem erhalten Sie einen direkten, Vollbild-Link, den Sie verschicken oder in einem Button wie z.B. "Hier die Lage entdecken" auf Ihren Präsenzen hinterlegen können.',
    locale: defaultLocale,
    target: 'div[data-tour="actions-top"]',
  },
];

export default Steps;
