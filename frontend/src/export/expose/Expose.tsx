import { MapClipping } from "context/SearchContext";
import React, { ForwardedRef } from "react";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  TransportationParam,
} from "../../../../shared/types/types";
import AreaButlerLogo from "../../assets/img/logo.jpg";
import { PdfPage } from "../PdfPage";
import { EntityGroup, ResultEntity } from "../../pages/SearchResultPage";
import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../../shared/constants/real-estate";
import {
  meansOfTransportations,
  unitsOfTransportation,
} from "../../../../shared/constants/constants";
import EntityGridSummary from "../EntityGridSummary";
import MapClippings from "../MapClippings";
import { CensusSummary } from "../CensusSummary";
import { EntityTable } from "export/EntityTable";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import FederalElectionSummary from "export/FederalElectionSummary";
import { SelectedMapClipping } from "export/MapClippingSelection";

export interface ExposeProps {
  entities: ResultEntity[];
  censusData: ApiGeojsonFeature[];
  federalElectionData: FederalElectionDistrict;
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  activePrinting: boolean;
  mapClippings: SelectedMapClipping[];
}

export const Expose = React.forwardRef(
  (props: ExposeProps, ref: ForwardedRef<HTMLDivElement>) => {
    const groupedEntries = props.groupedEntries
      .filter((group) => group.title !== "Wichtige Adressen")
      .filter((group) => group.active && group.items.length > 0);
    const importantEntites = props.groupedEntries.find(
      (group) => group.active && group.title === "Wichtige Adressen"
    );
    const transportationParams = props.transportationParams;
    const activePrinting = props.activePrinting;
    const mapClippings = props.mapClippings;
    const censusData = props.censusData;
    const federalElectionData = props.federalElectionData;

    const filteredGroups = groupedEntries.filter((group) => group.active);

    return (
      <div className="hidden print:block" ref={ref}>
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
                  präsentieren zu dürfen. Auf Basis Ihrer Bedürfnisse konnten
                  wir ein passendes Objekt in unserem Bestand auswählen, das
                  perfekt auf Ihre Kriterien abgestimmt ist.
                </p>
                <p className="mx-10 my-5">
                  Machen Sie sich auf den nächsten Seiten ein eigenes Bild!
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
                            {props.realEstateListing.costStructure.price.amount}{" "}
                            € (
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
                          <strong>Ausstattung:</strong>{" "}
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

                <div className="flex gap-4 justify-between m-10">
                  <div className="flex flex-col gap-6">
                    <h3 className="text-l font-bold">Ihre Bevorzugten Orte</h3>
                    <div className="flex flex-wrap gap-2">
                      {filteredGroups.length === 0 ? (
                        <div className="w-56 bg-primary rounded p-2 text-white flex gap-2">
                          <h5 className="text-xs">Keine Orte ausgewählt</h5>
                        </div>
                      ) : (
                        filteredGroups.map((group) => (
                          <div className="w-56 bg-primary rounded p-2 text-white flex gap-2">
                            <h5 className="text-xs">
                              {group.title} (
                              {Math.round(
                                Math.min(
                                  ...group.items.map((d) => d.distanceInMeters)
                                )
                              )}{" "}
                              m)
                            </h5>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <h3 className="text-l w-56 font-bold">
                      Ihre Mobilitätskriterien
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {transportationParams.map(
                        (routingProfile: TransportationParam) => (
                          <div className="w-48 bg-info rounded p-2 text-white text-xs flex gap-2">
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
              />
              {!!importantEntites && importantEntites.items.length > 0 && (
                <EntityTable entityGroup={importantEntites!}></EntityTable>
              )}
            </PdfPage>
            <PdfPage>
              <h1 className="m-10 text-xl font-bold">Kartenausschnitte</h1>
              <MapClippings mapClippings={mapClippings} />
            </PdfPage>
            {groupedEntries
              .filter(
                (entityGroup) =>
                  entityGroup.active &&
                  entityGroup.items.filter((i) => i.selected).length > 0
              )
              .map((entityGroup: EntityGroup) => {
                return (
                  <PdfPage>
                    <div
                      className="m-10"
                      key={"tab-content-" + entityGroup.title}
                    >
                      <EntityTable entityGroup={entityGroup}></EntityTable>
                    </div>
                  </PdfPage>
                );
              })}
            {!!censusData && censusData.length > 0 && (
              <PdfPage>
                <CensusSummary censusData={censusData} />
              </PdfPage>
            )}
            {!!federalElectionData && (
              <PdfPage>
                <FederalElectionSummary
                  federalElectionDistrict={federalElectionData}
                ></FederalElectionSummary>
              </PdfPage>
            )}
          </>
        )}
      </div>
    );
  }
);

export default Expose;
