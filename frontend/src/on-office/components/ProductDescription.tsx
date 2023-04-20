import { OnOfficeProductTypesEnum } from "../../../../shared/types/on-office";
import youtubeIcon from "../../assets/icons/youtube.svg";

export const getProductDescription = (
  name: string,
  type: OnOfficeProductTypesEnum
) => {
  switch (type) {
    case OnOfficeProductTypesEnum.OPEN_AI:
    case OnOfficeProductTypesEnum.OPEN_AI_50: {
      return OpenAiDescription(name);
    }

    case OnOfficeProductTypesEnum.MAP_IFRAME:
    case OnOfficeProductTypesEnum.MAP_IFRAME_50: {
      return MapIframeDescription(name);
    }

    case OnOfficeProductTypesEnum.ONE_PAGE:
    case OnOfficeProductTypesEnum.ONE_PAGE_50: {
      return OnePageDescription(name);
    }

    case OnOfficeProductTypesEnum.MAP_SNAPSHOT:
    default: {
      return MapSnapshotDescription(name);
    }
  }
};

const OpenAiDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7">{name}</div>

      <div className="flex flex-col items-start gap-3 min-h-[25vh]">
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

        <a target="_blank" rel="noreferrer" href="https://youtu.be/ap13eQuNK9s">
          <div className="inline-flex items-center gap-2">
            <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
            <div>Erklärvideo</div>
          </div>
        </a>
      </div>
    </>
  );
};

const MapIframeDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7">{name}</div>

      <div className="flex flex-col items-start gap-3 min-h-[25vh]">
        <div className="text-justify">
          Erhalten Sie interaktive Karten, im eigenen Design, für alle Medien.
          Passen Sie Inhalte und Aussehen auf Ihre Zielgruppe an.
        </div>

        <ul className="list-disc pl-5 text-left ">
          <li>iFrame</li>
          <li>QR Code</li>
          <li>Hyperlink</li>
        </ul>

        <a target="_blank" rel="noreferrer" href="https://youtu.be/DfFqoe4WYNg">
          <div className="inline-flex items-center gap-2">
            <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
            <div>Erklärvideo</div>
          </div>
        </a>
      </div>
    </>
  );
};

const OnePageDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7">{name}</div>

      <div className="flex flex-col items-start gap-3 min-h-[25vh]">
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

        <div className="inline-flex items-center gap-2">
          <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
          <div>Erklärvideo</div>
        </div>
      </div>
    </>
  );
};

const MapSnapshotDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7">{name}</div>

      <div className="flex flex-col items-start gap-3 min-h-[25vh]">
        <div className="text-justify">
          Erstellen Sie hochauflösende Kartenaufnahmen, in Ihrem Design, mit der
          Erreichbarkeitslinie für alle Mobilitätsarten, POIs und Distanzen.
        </div>

        <a target="_blank" rel="noreferrer" href="https://youtu.be/mbLm2MzKgMQ">
          <div className="inline-flex items-center gap-2">
            <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
            <div>Erklärvideo</div>
          </div>
        </a>
      </div>
    </>
  );
};

/* Coming soon template

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

 */
