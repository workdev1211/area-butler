import {MapClipping} from "context/SearchContext";
import PersonaRanking from "export/PersonaRanking";
import {EntityGroup, ResultEntity} from "pages/SearchResultPage";
import React from "react";
import {allFurnishing, allRealEstateCostTypes,} from "../../../../shared/constants/real-estate";
import {ApiPersonaType} from "../../../../shared/types/persona";
import {ApiRealEstateListing} from "../../../../shared/types/real-estate";
import {ApiGeojsonFeature, ApiSearchResponse, TransportationParam,} from "../../../../shared/types/types";
import {CensusSummary} from "../CensusSummary";
import MapClippings from "../MapClippings";
import {PdfPage} from "../PdfPage";
import AreaButlerLogo from "../../assets/img/logo.jpg";
import {EntityList} from "export/EntityList";

export interface CheatsheetProps {
  searchResponse: ApiSearchResponse;
  entities: ResultEntity[];
  censusData: ApiGeojsonFeature[];
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  activePrinting: boolean;
  mapClippings: MapClipping[];
}

export const Cheatsheet = React.forwardRef((props: CheatsheetProps, ref) => {
  const groupedEntries = props.groupedEntries
    .filter((group: EntityGroup) => group.title !== "Wichtige Adressen")
    .filter((group) => group.active && group.items.length > 0);
  const activePrinting = props.activePrinting;
  const mapClippings = props.mapClippings;
  const censusData = props.censusData;

  const mockData = {
    [ApiPersonaType.ACTIVE_SENIORS]: 5,
    [ApiPersonaType.HIGH_CLASS]: 1,
    [ApiPersonaType.MIDDLE_CLASS]: 3,
    [ApiPersonaType.PROFESSIONAL_SINGLE]: 4,
    [ApiPersonaType.STUDENTS]: 2,
    [ApiPersonaType.YOUNG_FAMILY]: 1,
  };

  return (
    <div className="hidden print:block" ref={ref as any}>
      <PdfPage>
        <div className="flex justify-center items-center flex-col mt-16">
          <div className="bg-primary w-96 h-24">
            <img src={AreaButlerLogo} alt="Logo" />
          </div>
          <h1 className="mx-10 mt-10 mb-40 text-3xl font-extrabold">
            Alle Informationen auf einen Blick
          </h1>
        </div>
        <div className="flex flex-col gap-6" style={{ width: "1600px" }}>
          {!!props.realEstateListing && (
            <>
              <h3 className="text-3xl w-56 font-bold">Objektdetails</h3>
              <div className="font-bold">{props.realEstateListing.address}</div>

              {!!props.realEstateListing?.costStructure?.type &&
                !!props.realEstateListing?.costStructure?.price && (
                  <div>
                    <strong>Kosten:</strong>{" "}
                    {props.realEstateListing.costStructure.price.amount} € (
                    {
                      allRealEstateCostTypes.find(
                        (t) =>
                          t.type === props.realEstateListing.costStructure?.type
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
          <h1 className="text-3xl mb-5 font-bold">Personengruppen</h1>
          <PersonaRanking rankings={mockData} />
          {!!censusData && censusData.length > 0 && (
            <CensusSummary censusData={censusData} />
          )}
        </div>
      </PdfPage>
      <PdfPage>
        <h1 className="text-3xl font-bold mb-5">Die nächsten Orte</h1>
        <div className="flex gap-6 flex-wrap">
          {groupedEntries.map((group) => {
            return (
              <div className="text-xs w-72" key={"tab-content-" + group.title}>
                <EntityList entityGroup={group} limit={3}/>
              </div>
            );
          })}
        </div>
        {activePrinting && (
          <>
            <h1 className="my-5 text-3xl font-bold">Kartenausschnitte</h1>
            <MapClippings mapClippings={mapClippings} showTitles={false} />
          </>
        )}
      </PdfPage>
    </div>
  );
});

export default Cheatsheet;
