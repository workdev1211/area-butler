import { EntityList } from "export/EntityList";
import FederalElectionSummary from "export/FederalElectionSummary";
import { SelectedMapClipping } from "export/MapClippingSelection";
import ParticlePollutionSummary from "export/ParticlePollutionSummary";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { EntityGroup, ResultEntity } from "pages/SearchResultPage";
import React from "react";
import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../../shared/constants/real-estate";
import { ApiPersonaType } from "../../../../shared/types/persona";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiSearchResponse,
  ApiUser,
  TransportationParam,
} from "../../../../shared/types/types";
import { CensusSummary } from "../CensusSummary";
import MapClippings from "../MapClippings";
import { PdfPage } from "../PdfPage";

export interface CheatsheetProps {
  searchResponse: ApiSearchResponse;
  entities: ResultEntity[];
  censusData: ApiGeojsonFeature[];
  particlePollutionData: ApiGeojsonFeature[];
  federalElectionData: FederalElectionDistrict;
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  activePrinting: boolean;
  mapClippings: SelectedMapClipping[];
  user: ApiUser | null;
}

export const Cheatsheet = React.forwardRef((props: CheatsheetProps, ref) => {
  const groupedEntries = props.groupedEntries
    .filter((group: EntityGroup) => group.title !== "Wichtige Adressen")
    .filter((group) => group.active && group.items.length > 0);
  const mapClippings = props.mapClippings;
  const censusData = props.censusData;
  const federalElectionData = props.federalElectionData;
  const user = props.user;
  const particlePollutionData = props.particlePollutionData;

  const filteredGroups = groupedEntries.filter((group) => group.active);

  const mockData = {
    [ApiPersonaType.ACTIVE_SENIORS]: 5,
    [ApiPersonaType.HIGH_CLASS]: 1,
    [ApiPersonaType.MIDDLE_CLASS]: 3,
    [ApiPersonaType.PROFESSIONAL_SINGLE]: 4,
    [ApiPersonaType.STUDENTS]: 2,
    [ApiPersonaType.YOUNG_FAMILY]: 1,
  };

  // TODO This can't be right
  let page = 0;
  const nextPageNumber = (() => {
    page++;
    return page < 9 ? '0' + page : '' + page; 
  });

  return (
    <div className="overflow-hidden w-0 h-0 print:overflow-visible print:w-full print:h-full print:block" ref={ref as any}>
      <PdfPage title="Zusammenfassung" logo={user?.logo} nextPageNumber={nextPageNumber}>
        <div className="m-10 flex flex-col gap-2">
          {!!props.realEstateListing && (
            <>
              <h3 className="text-2xl w-56 font-bold">Objektdetails</h3>
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
        </div>
        <div className="mx-10 flex gap-6 flex-wrap">
          {filteredGroups.length === 0 ? (
            <div>Keine Orte ausgewählt</div>
          ) : (
            filteredGroups.map((group) => {
              return (
                <div
                  className="text-xs"
                  key={"tab-content-" + group.title}
                >
                  <EntityList entityGroup={group} limit={3} primaryColor={user?.color} />
                </div>
              );
            })
          )}
        </div>
      </PdfPage>
      {mapClippings.length > 0 && <MapClippings mapClippings={mapClippings} logo={user?.logo} nextPageNumber={nextPageNumber} />}
      <PdfPage title="Einblicke" logo={user?.logo} nextPageNumber={nextPageNumber}>
        {!!censusData && censusData.length > 0 && (
          <>
            <h4 className="mx-10 mt-5 text-xl w-56 font-bold">Nachbarschaftsdemographie</h4>
            <CensusSummary primaryColor={user?.color} censusData={censusData} />
          </>
        )}
        {!!federalElectionData && (
          <>
            <h4 className="mx-10 text-xl w-56 font-bold">Bundestagswahl 2021</h4>
            <FederalElectionSummary
              primaryColor={user?.color}
              federalElectionDistrict={federalElectionData}
            ></FederalElectionSummary>
          </>
        )}
        {!!particlePollutionData && particlePollutionData.length > 0 && (
          <>
            <h4 className="mx-10 text-xl w-56 font-bold">Feinstaubbelastung</h4>
            <ParticlePollutionSummary
              primaryColor={user?.color}
              particlePollutionData={particlePollutionData}
            />
          </>
        )}
      </PdfPage>
    </div>
  );
});

export default Cheatsheet;
