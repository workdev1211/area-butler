import { OnOfficeProductTypesEnum } from "../../../../shared/types/on-office";

export const getProductDescription = (type: OnOfficeProductTypesEnum) => {
  switch (type) {
    case OnOfficeProductTypesEnum.OPEN_AI: {
      return OpenAiDescription();
    }
    case OnOfficeProductTypesEnum.OPEN_AI_50: {
      return OpenAiDescription("KI-Assistent x50");
    }

    case OnOfficeProductTypesEnum.MAP_IFRAME: {
      return MapIframeDescription();
    }
    case OnOfficeProductTypesEnum.MAP_IFRAME_50: {
      return MapIframeDescription("Interaktive Karten Paket x50");
    }

    case OnOfficeProductTypesEnum.ONE_PAGE: {
      return OnePageDescription();
    }
    case OnOfficeProductTypesEnum.ONE_PAGE_50: {
      return OnePageDescription("Automatisches Lage-Exposé x50");
    }

    case OnOfficeProductTypesEnum.MAP_SNAPSHOT:
    default: {
      return MapSnapshotDescription();
    }
  }
};

const OpenAiDescription = (title = "KI-Assistent") => {
  return (
    <>
      <h2 className="card-title w-full">{title}</h2>

      <div className="flex flex-col gap-3 min-h-[27vh]">
        <div className="text-justify">
          Erhalten Sie Inspiration aus der magischen Feder. Mit
          Standortanalyse-Infos, den Fakten Ihren Immobilien.
        </div>

        <ul className="list-disc pl-5 text-left ">
          <li>Lagetexte</li>
          <li>Immobilienbeschreibungen</li>
          <li>Exposé Texte</li>
          <li>Generelle Anfragen an KI</li>
          <li>u.v.m.</li>
        </ul>
      </div>
    </>
  );
};

const MapIframeDescription = (title = "Interaktive Karten Paket") => {
  return (
    <>
      <h2 className="card-title w-full">{title}</h2>

      <div className="flex flex-col gap-3 min-h-[27vh]">
        <div className="text-justify">
          Erhalten Sie interaktive Karten, im eigenen Design, für alle Medien.
          Passen Sie Inhalte und Aussehen auf Ihre Zielgruppe an.
        </div>

        <ul className="list-disc pl-5 text-left ">
          <li>iFrame</li>
          <li>QR Code</li>
          <li>Hyperlink</li>
        </ul>

        <div
          className="absolute font-bold text-4xl top-1/2 left-1/2"
          style={{
            transform: "translate(-50%, -50%) rotate(-45deg)",
            letterSpacing: "1rem",
            opacity: 0.4,
          }}
        >
          Coming soon
        </div>
      </div>
    </>
  );
};

const OnePageDescription = (title = "Automatisches Lage-Exposé") => {
  return (
    <>
      <h2 className="card-title w-full">{title}</h2>

      <div className="flex flex-col gap-3 min-h-[27vh]">
        <div className="text-justify">
          Erhalten Sie ein fertiges Lage-Exposé auf einer DinA4 Seite.
          Beinhaltet:
        </div>

        <ul className="list-disc pl-5 text-left ">
          <li>KI-Lagetext & vollen Assistent</li>
          <li>POI Tabelle mit 8 POIs und Designten Icons</li>
          <li>Bild der Mikro-, Makro-Lage und QR-Code</li>
        </ul>

        <div className="text-justify">
          Perfekte Vorbereitung für die Akquise. Perfekte Vermarktung der Lage
          im Vertrieb.
        </div>
      </div>

      <div
        className="absolute font-bold text-4xl top-1/2 left-1/2"
        style={{
          transform: "translate(-50%, -50%) rotate(-45deg)",
          letterSpacing: "1rem",
          opacity: 0.4,
        }}
      >
        Coming soon
      </div>
    </>
  );
};

const MapSnapshotDescription = (title = "Lagepläne und Distanzen") => {
  return (
    <>
      <h2 className="card-title w-full">{title}</h2>

      <div className="text-justify min-h-[27vh]">
        Erstellen Sie hochauflösende Kartenaufnahmen, in Ihrem Design, mit der
        Erreichbarkeitslinie für alle Mobilitätsarten, POIs und Distanzen.
      </div>
    </>
  );
};
