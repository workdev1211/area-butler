import { MapClipping } from "context/SearchContext";
import { fallbackIcon, osmNameToIcons } from "map/makiIcons";
import React from "react";
import ResultTable from "search/ResultTable";
import { ResultEntity } from "search/SearchResult";
import {
  meansOfTransportations,
  unitsOfTransportation
} from "../../../shared/constants/constants";
import {
  allFurnishing,
  allRealEstateCostTypes
} from "../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import {
  ApiSearchResponse,
  MeansOfTransportation,
  TransportationParam
} from "../../../shared/types/types";
import AreaButlerLogo from "../assets/img/areabutler-logo.jpg";
import EntityGridSummary from "./EntityGridSummary";
import MapClippings from "./MapClippings";
import { PdfPage } from "./PdfPage";

export interface ExposeProps {
  searchResponse: ApiSearchResponse;
  entities: ResultEntity[];
  groupedEntries: any;
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  activePrinting: boolean;
  mapClippings: MapClipping[];
}

export const Expose = React.forwardRef((props: ExposeProps, ref) => {
  const groupedEntries = props.groupedEntries.filter(
    ([label, data]: any) => label !== "Wichtige Adressen"
  );
  const importantEntites = props.groupedEntries.find(
    ([label, data]: any) => label === "Wichtige Adressen"
  );
  const transportationParams = props.transportationParams;
  const activePrinting = props.activePrinting;
  const entites = props.entities;
  const searchResponse = props.searchResponse;
  const mapClippings = props.mapClippings;
  const routingKeys = Object.keys(searchResponse!.routingProfiles);

  const mapMeans = {
    byFoot: routingKeys.includes(MeansOfTransportation.WALK),
    byBike: routingKeys.includes(MeansOfTransportation.BICYCLE),
    byCar: routingKeys.includes(MeansOfTransportation.CAR)
}

  return (
    <div className="hidden print:block" ref={ref as any}>
      {activePrinting && (
        <>
          <PdfPage>
            <div className="flex justify-center items-center flex-col mt-32">
              <div className="bg-primary w-96 h-24">
                <img src={AreaButlerLogo} alt="Logo" />
              </div>
              <h1 className="mx-10 mt-10 text-3xl text-primary font-bold">
                IHRE PERSONALISIERTE UMGEBUNGSANALYSE
              </h1>
            </div>
            <div>
              <h1 className="m-10 text-xl font-bold">Hallo!</h1>
              <p className="mx-10 my-5">
                Wir freuen uns sehr, Ihnen Ihre persönliche Umgebungsanalyse
                präsentieren zu dürfen. Auf Basis Ihrer Bedürfnisse konnten wir
                ein passendes Objekt in unserem Bestand auswählen, das perfekt
                auf Ihre Kriterien abgestimmt ist.
              </p>
              <p className="mx-10 my-5">
                Machen Sie sich auf den nächsten Seite ein eigenes Bild
              </p>
              <div className="flex flex-col gap-2 m-10">
                {!props.realEstateListing && (
                  <>
                    <h3 className="text-xl w-56 font-bold">Ihr Umfeld</h3>
                    <div className="font-bold">{props.listingAddress}</div>
                  </>
                )}
                {!!props.realEstateListing && (
                  <>
                    <h3 className="text-xl w-56 font-bold">Unser Objekt</h3>
                    <div className="font-bold">
                      {props.realEstateListing.address}
                    </div>

                    {!!props.realEstateListing?.costStructure?.type &&
                      !!props.realEstateListing?.costStructure?.price && (
                        <div>
                          <strong>Kosten:</strong>{" "}
                          {props.realEstateListing.costStructure.price.amount} €
                          (
                          {
                            allRealEstateCostTypes.find(
                              (t) =>
                                t.type ===
                                props.realEstateListing.costStructure?.type
                            )?.label
                          }
                          )
                        </div>
                      )}
                    {props.realEstateListing.characteristics?.furnishing && (
                      <div>
                        <strong>Austattung:</strong>{" "}
                        {allFurnishing
                          .filter((f) =>
                            props.realEstateListing.characteristics?.furnishing.includes(
                              f.type
                            )
                          )
                          .map((f) => f.label)
                          .join(", ")}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-6 justify-between m-10">
                <div className="flex flex-col gap-6">
                  <h3 className="text-xl font-bold">Ihre Bevorzugten Orte</h3>
                  <div className="flex flex-wrap gap-2">
                    {groupedEntries.map(
                      ([label, data]: [string, ResultEntity[]]) => (
                        <div className="w-56 bg-primary rounded p-2 text-white flex gap-2">
                          <img
                            alt="icon"
                            src={
                              osmNameToIcons.find(
                                (entry) => entry.name === data[0].type
                              )?.icon || fallbackIcon
                            }
                            className={data[0].type}
                          />
                          <h5 className="text-xs">
                            {label} (
                            {Math.round(
                              Math.min(...data.map((d) => d.distanceInMeters))
                            )}{" "}
                            m)
                          </h5>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <h3 className="text-xl w-56 font-bold">
                    Ihre Mobilitätskriterien
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {transportationParams.map(
                      (routingProfile: TransportationParam) => (
                        <div className="w-48 bg-secondary rounded p-2 text-white text-xs flex gap-2">
                          <span>
                            {
                              meansOfTransportations.find(
                                (means) => means.type === routingProfile.type
                              )?.label
                            }{" "}
                            ({routingProfile.amount}{" "}
                            {
                              unitsOfTransportation.find(
                                (unit) => unit.type === routingProfile.unit
                              )?.label
                            }
                            )
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </PdfPage>
          <PdfPage>
            <h1 className="m-10 text-xl font-bold">
              Zusammenfassung und wichtige Adressen
            </h1>
            <EntityGridSummary
              groupedEntries={groupedEntries}
              transportationParams={transportationParams}
            ></EntityGridSummary>
            {!!importantEntites && (
              <div className="m-10" key={"tab-content-" + importantEntites[0]}>
                <ResultTable
                  title={importantEntites[0]}
                  data={importantEntites[1]}
                />
              </div>
            )}
          </PdfPage>
          <PdfPage>
            <h1 className="m-10 text-xl font-bold">Kartenausschnitte</h1>
            <MapClippings mapClippings={mapClippings}></MapClippings>
          </PdfPage>
          {groupedEntries.map(([label, data]: any, index: number) => {
            return (
              <PdfPage>
                <div className="m-10" key={"tab-content-" + label}>
                  <ResultTable title={label} data={data} />
                </div>
              </PdfPage>
            );
          })}
        </>
      )}
    </div>
  );
});

export default Expose;
