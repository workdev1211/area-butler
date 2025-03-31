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
            <div className="text-xl font-bold">Site plans</div>
            <ul className="list-disc pl-5 text-left">
              <li>Own colors and Logos</li>
              <li>Mobility, POIs, Distances</li>
              <li>Map or Aerial photograph</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">AI texts with quality</div>
            <ul className="list-disc pl-5 text-left">
              <li>Location texts & Property description</li>
              <li>Exposé texts & Social media</li>
              <li>Including all location data</li>
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
            <div className="text-xl font-bold">Interactive Map</div>
            <ul className="list-disc pl-5 text-left">
              <li>For Web exposé & Homepage</li>
              <li>As a link, QR code or iFrame</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">Location exposé</div>
            <ul className="list-disc pl-5 text-left">
              <li>All location information on one page</li>
              <li>As pdf or png</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">
              Acquisition & Sales documents
            </div>
            <ul className="list-disc pl-5 text-left">
              <li>All neighborhood data</li>
              <li>Perfectly prepared for everything around location</li>
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
          <div>With monthly or annual payment.</div>
          <div>Everything from P2 with many advantages:</div>

          <ul className="list-disc pl-5 text-left text-xl font-bold">
            <li>Tickets are always online</li>
            <li>Quota does not expire</li>
            <li>Training & Onboarding</li>
            <li>Automation with Webhooks</li>
            <li>Quantity, IVD and bvfi discounts</li>
            <li>Adaptable to your needs</li>
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
