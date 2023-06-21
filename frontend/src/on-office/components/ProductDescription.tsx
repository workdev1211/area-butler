import youtubeIcon from "../../assets/icons/youtube.svg";
import { OnOfficeProductTypesEnum } from "../../../../shared/types/on-office";

export const getProductDescription = (
  name: string,
  type: OnOfficeProductTypesEnum
) => {
  switch (type) {
    case OnOfficeProductTypesEnum.OPEN_AI: {
      return OpenAiDescription(name);
    }

    case OnOfficeProductTypesEnum.MAP_IFRAME: {
      return MapIframeDescription(name);
    }

    case OnOfficeProductTypesEnum.ONE_PAGE: {
      return OnePageDescription(name);
    }

    case OnOfficeProductTypesEnum.STATS_EXPORT: {
      return StatsExportDescription(name);
    }

    case OnOfficeProductTypesEnum.SUBSCRIPTION: {
      return SubscriptionDescription(name);
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
      <div className="card-title w-full mb-7 text-center">{name}</div>

      <div className="flex flex-col items-start gap-3 h-full">
        <a target="_blank" rel="noreferrer" href="https://youtu.be/ap13eQuNK9s">
          <div className="inline-flex items-center gap-2">
            <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
            <div>Mehr Informationen...</div>
          </div>
        </a>

        <div className="flex flex-col text-justify">
          <div>Alles aus P1, plus:</div>
          <div>
            Inspiration aus der magischen Feder. Mit Standortanalyse-Infos, den
            Fakten Ihren Immobilien.
          </div>
        </div>

        <ul className="list-disc pl-5 text-left ">
          <li>Lagepläne und Distanzen</li>
          <li>Lagetexte</li>
          <li>Immobilienbeschreibungen</li>
          <li>Exposé Texte</li>
          <li>Generelle Anfragen an KI</li>
        </ul>
      </div>
    </>
  );
};

const MapIframeDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7 text-center">{name}</div>

      <div className="flex flex-col items-start gap-3 h-full">
        <a target="_blank" rel="noreferrer" href="https://youtu.be/DfFqoe4WYNg">
          <div className="inline-flex items-center gap-2">
            <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
            <div>Mehr Informationen...</div>
          </div>
        </a>

        <div className="flex flex-col text-justify">
          <div>Alles aus P2, plus:</div>
          <div>
            Interaktive Karten, im eigenen Design, für alle Medien. Passen Sie
            Inhalte und Aussehen auf Ihre Zielgruppe an:
          </div>
        </div>

        <ul className="list-disc pl-5 text-left ">
          <li>iFrame für Ihre Website</li>
          <li>QR-Code</li>
          <li>Hyperlink</li>
        </ul>
      </div>
    </>
  );
};

const OnePageDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7 text-center">{name}</div>

      <div className="flex flex-col items-start gap-3 h-full">
        <div className="inline-flex items-center gap-2">
          <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
          <div>Mehr Informationen...</div>
        </div>

        <div className="flex flex-col text-justify">
          <div>Alles aus P3, plus:</div>
          <div>Alle Infos auf einer DinA4 Seite.</div>
        </div>

        <ul className="list-disc pl-5 text-left ">
          <li>KI-Lagetext</li>
          <li>POI Tabelle mit 8 POIs und Designten Icons</li>
          <li>Bild der Mikro-, Makro-Lage und QR-Code</li>
        </ul>

        <div className="text-justify">
          Perfekte Vorbereitung für die Akquise. Perfekte Vermarktung der Lage
          im Vertrieb.
        </div>
      </div>
    </>
  );
};

const StatsExportDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7 text-center">{name}</div>

      <div className="flex flex-col items-start gap-3 h-full">
        <div className="inline-flex items-center gap-2">
          <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
          <div>Mehr Informationen...</div>
        </div>

        <div className="flex flex-col text-justify">
          <div>Alles aus P4, plus:</div>
          <div>
            Lage-Indizes, Nachbarschaftsdaten, sozio-demografische Daten,
            Umfeldanalyse pdf und Überblick.
          </div>
        </div>

        <ul className="list-disc pl-5 text-left ">
          <li>Alle Daten und Einblicke in die Nachbarschaft</li>
          <li>Lage Indizes</li>
          <li>Schnelldokumente für Einkaufstermine und Vertrieb</li>
        </ul>
      </div>
    </>
  );
};

const SubscriptionDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7 text-center">{name}</div>

      <div className="flex flex-col items-start gap-3 h-full">
        <a target="_blank" rel="noreferrer" href="https://youtu.be/mbLm2MzKgMQ">
          <div className="inline-flex items-center gap-2">
            <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
            <div>Mehr Informationen...</div>
          </div>
        </a>

        <div className="text-justify">
          In naher Zukunft werden wir auch in onOffice ein flexibles Abo-Modell
          ermöglichen. So werden wir in der Lage sein, einen noch niedrigeren
          Stückpreis anzubieten. Sie haben generelle Fragen oder bereits jetzt
          Interesse an einem Abo? Sprechen Sie uns gerne an:
        </div>
      </div>
    </>
  );
};

const MapSnapshotDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full mb-7 text-center">{name}</div>

      <div className="flex flex-col items-start gap-3 h-full">
        <a target="_blank" rel="noreferrer" href="https://youtu.be/mbLm2MzKgMQ">
          <div className="inline-flex items-center gap-2">
            <img className="w-8" src={youtubeIcon} alt="youtube-icon" />{" "}
            <div>Mehr Informationen...</div>
          </div>
        </a>

        <div className="text-justify">
          Erstellen Sie hochauflösende Kartenaufnahmen, in Ihrem Design, mit
          allen Mobilitätsarten, POIs und Distanzen.
        </div>
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
