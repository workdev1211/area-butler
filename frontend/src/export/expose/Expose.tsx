import { EntityTable } from "export/EntityTable";
import FederalElectionSummary from "export/FederalElectionSummary";
import { SelectedMapClipping } from "export/MapClippingSelection";
import ParticlePollutionSummary from "export/ParticlePollutionSummary";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import React, { ForwardedRef } from "react";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation,
  TransportationParam
} from "../../../../shared/types/types";
import { EntityGroup } from "../../pages/SearchResultPage";
import { CensusSummary } from "../CensusSummary";
import MapClippings from "../MapClippings";
import { PdfPage } from "../PdfPage";
import ExposeSummary from "./ExposeSummary";

export interface ExposeProps {
  censusData: ApiGeojsonFeature[];
  federalElectionData: FederalElectionDistrict;
  particlePollutionData: ApiGeojsonFeature[];
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  activePrinting: boolean;
  mapClippings: SelectedMapClipping[];
  user: ApiUser | null;
}

export const Expose = React.forwardRef(
  (props: ExposeProps, ref: ForwardedRef<HTMLDivElement>) => {
    const groupedEntries = props.groupedEntries
      .filter(group => group.title !== "Wichtige Adressen")
      .filter(group => group.active && group.items.length > 0);
    const importantEntites = props.groupedEntries.find(
      group => group.active && group.title === "Wichtige Adressen"
    );
    const transportationParams = props.transportationParams;
    const mapClippings = props.mapClippings;
    const censusData = props.censusData;
    const federalElectionData = props.federalElectionData;
    const particlePollutionData = props.particlePollutionData;
    const activeMeans = props.activeMeans;
    const user = props.user;

    let page = 0;
    const nextPageNumber = () => {
      page++;
      return page < 9 ? "0" + page : "" + page;
    };

    return (
      <div
        className="overflow-hidden w-0 h-0 print:overflow-visible print:w-full print:h-full print:block"
        ref={ref}
      >
        <>
          <PdfPage
            nextPageNumber={nextPageNumber}
            logo={user?.logo}
            title="Überblick"
          >
            <ExposeSummary
              realEstateListing={props.realEstateListing}
              groupedEntries={groupedEntries}
              transportationParams={transportationParams}
              activeMeans={activeMeans}
              listingAddress={props.listingAddress}
              primaryColor={user?.color}
            />
          </PdfPage>
          {!!importantEntites?.items?.length && (
            <PdfPage
              nextPageNumber={nextPageNumber}
              logo={user?.logo}
              title="Umgebung"
            >
              {!!importantEntites && importantEntites.items.length > 0 && (
                <div className="m-10">
                  <EntityTable
                    activeMeans={activeMeans}
                    entityGroup={importantEntites!}
                    primaryColor={user?.color}
                  />
                </div>
              )}
            </PdfPage>
          )}
          {mapClippings.length > 0 && (
            <MapClippings
              mapClippings={mapClippings}
              nextPageNumber={nextPageNumber}
              logo={user?.logo}
            />
          )}
          {groupedEntries
            .filter(
              entityGroup =>
                entityGroup.active &&
                entityGroup.items.filter(i => i.selected).length > 0
            )
            .map((entityGroup: EntityGroup) => {
              return (
                <PdfPage
                  nextPageNumber={nextPageNumber}
                  logo={user?.logo}
                  title={entityGroup.title}
                >
                  <div
                    className="m-10"
                    key={"tab-content-" + entityGroup.title}
                  >
                    <EntityTable
                      activeMeans={activeMeans}
                      entityGroup={entityGroup}
                      primaryColor={user?.color}
                    />
                  </div>
                </PdfPage>
              );
            })}
          <PdfPage
            title="Einblicke"
            logo={user?.logo}
            nextPageNumber={nextPageNumber}
          >
            {!!censusData && censusData.length > 0 && (
              <>
                <h4 className="mx-10 mt-5 text-xl w-56 font-bold">
                  Nachbarschaftsdemographie
                </h4>
                <CensusSummary
                  primaryColor={user?.color}
                  censusData={censusData}
                />
              </>
            )}
            {!!federalElectionData && (
              <>
                <h4 className="mx-10 text-xl w-56 font-bold">
                  Bundestagswahl 2021
                </h4>
                <FederalElectionSummary
                  primaryColor={user?.color}
                  federalElectionDistrict={federalElectionData}
                />
              </>
            )}
            {!!particlePollutionData && particlePollutionData.length > 0 && (
              <>
                <h4 className="mx-10 text-xl w-56 font-bold">
                  Feinstaubbelastung
                </h4>
                <ParticlePollutionSummary
                  primaryColor={user?.color}
                  particlePollutionData={particlePollutionData}
                />
              </>
            )}
          </PdfPage>
        </>
      </div>
    );
  }
);

export default Expose;
