import { OnOfficeProductTypesEnum } from "../../../shared/types/on-office";
import { TIntegrationProductType } from "../../../shared/types/integration";
import { PropstackProductTypeEnum } from "../../../shared/types/propstack";

export const getProductDescription = (
  name: string,
  type: TIntegrationProductType
) => {
  switch (type) {
    case OnOfficeProductTypesEnum.OPEN_AI:
    case PropstackProductTypeEnum.OPEN_AI: {
      return OpenAiDescription(name);
    }

    case OnOfficeProductTypesEnum.STATS_EXPORT:
    case PropstackProductTypeEnum.STATS_EXPORT: {
      return StatsExportDescription(name);
    }

    case OnOfficeProductTypesEnum.SUBSCRIPTION:
    case PropstackProductTypeEnum.SUBSCRIPTION: {
      return SubscriptionDescription(name);
    }

    default: {
      const msg = `Product with type ${type} not found!`;
      console.error(msg);
      throw new Error(msg);
    }
  }
};

const OpenAiDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full text-center">{name}</div>

      <div className="flex flex-col items-start gap-5 h-full">
        {/*<div className="flex justify-center items-center gap-5 w-full">*/}
        {/*  <a*/}
        {/*    className="link link-hover"*/}
        {/*    target="_blank"*/}
        {/*    rel="noreferrer"*/}
        {/*    href="https://areabutler.de/page/der-turbo-fuer-ihre-immobilienbeschreibungen"*/}
        {/*  >*/}
        {/*    Mehr Informationen...*/}
        {/*  </a>*/}
        {/*</div>*/}

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">Lagepläne</div>
            <ul className="list-disc pl-5 text-left">
              <li>eigene Farben und Logos</li>
              <li>Mobilität, POIs, Distanzen</li>
              <li>Karte oder Luftbild</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">KI-Texte mit Qualität</div>
            <ul className="list-disc pl-5 text-left">
              <li>Lagetexte & Objektbeschreibung</li>
              <li>Exposétexte & Social Media</li>
              <li>Inkl. aller Standortdaten</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

const StatsExportDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full text-center">{name}</div>

      <div className="flex flex-col items-start gap-5 h-full">
        {/*<div className="flex justify-center items-center gap-5 w-full">*/}
        {/*  <a*/}
        {/*    className="link link-hover"*/}
        {/*    target="_blank"*/}
        {/*    rel="noreferrer"*/}
        {/*    href="https://areabutler.de/page/alle-features"*/}
        {/*  >*/}
        {/*    Mehr Informationen...*/}
        {/*  </a>*/}
        {/*</div>*/}

        <div className="flex flex-col gap-5">
          <div>Alles aus P1 plus:</div>

          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">Interaktive Karte</div>
            <ul className="list-disc pl-5 text-left">
              <li>Für Web-Exposé & Homepage</li>
              <li>Als Link, QR-Code oder iFrame</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">Lage-Exposé</div>
            <ul className="list-disc pl-5 text-left">
              <li>Alle Lage Infos auf einer Seite</li>
              <li>Als pdf oder png</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">
              Akquise & Vertriebsdokumente
            </div>
            <ul className="list-disc pl-5 text-left">
              <li>Alle Nachbarschaftsdaten</li>
              <li>Perfekt Vorbereitet für alles rund um Lage</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

const SubscriptionDescription = (name: string) => {
  return (
    <>
      <div className="card-title w-full text-center">{name}</div>

      <div className="flex flex-col items-start gap-5 h-full">
        {/*<div className="flex justify-center items-center gap-5 w-full">*/}
        {/*  <a*/}
        {/*    className="link link-hover"*/}
        {/*    target="_blank"*/}
        {/*    rel="noreferrer"*/}
        {/*    href="https://calendly.com/areabutler/30-minuten-area-butler"*/}
        {/*  >*/}
        {/*    Mehr Informationen...*/}
        {/*  </a>*/}
        {/*</div>*/}

        <div className="flex flex-col gap-5">
          <div>Mit monatlicher oder jährlicher Zahlung.</div>
          <div>Alles aus P2 mit vielen Vorteilen:</div>

          <ul className="list-disc pl-5 text-left text-xl font-bold">
            <li>Karten sind immer Online</li>
            <li>Kontingent verfällt nicht</li>
            <li>Schulung & Onboarding</li>
            <li>Automatisierung mit Webhooks</li>
            <li>Mengen-, IVD- und bvfi- Rabatt</li>
            <li>An Ihren Bedarf anpassbar</li>
          </ul>
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
