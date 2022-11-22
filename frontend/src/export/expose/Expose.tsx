import React, { ForwardedRef, forwardRef } from "react";

import { EntityTable } from "export/EntityTable";
import FederalElectionSummary from "export/FederalElectionSummary";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import ParticlePollutionSummary from "export/ParticlePollutionSummary";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation,
  TransportationParam,
} from "../../../../shared/types/types";
import { CensusSummary } from "../CensusSummary";
import MapClippings from "../MapClippings";
import { PdfPage } from "../PdfPage";
import ExposeSummary from "./ExposeSummary";
import AreaButlerLogo from "../../assets/img/logo.jpg";
import { EntityGroup } from "../../components/SearchResultContainer";
import { ILegendItem, Legend } from "../Legend";
import { IQrCodeState } from "../ExportModal";
import areaButlerLogo from "../../assets/img/logo.svg";
import { ApiSubscriptionPlanType } from "../../../../shared/types/subscription-plan";

interface IExposeProps {
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  activePrinting: boolean;
  mapClippings: ISelectableMapClipping[];
  user: ApiUser | null;
  color?: string;
  legend: ILegendItem[];
  qrCode: IQrCodeState;
  censusData?: ApiGeojsonFeature[];
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
}

export const Expose = forwardRef(
  (props: IExposeProps, ref: ForwardedRef<HTMLDivElement>) => {
    // TODO change to reduce only
    const groupedEntries = props.groupedEntries
      .filter((group) => group.title !== "Wichtige Adressen")
      .filter((group) => group.active && group.items.length > 0);

    const importantEntities = props.groupedEntries.find(
      (group) => group.active && group.title === "Wichtige Adressen"
    );

    const transportationParams = props.transportationParams;
    const mapClippings = props.mapClippings;
    const censusData = props.censusData;
    const federalElectionData = props.federalElectionData;
    const particlePollutionData = props.particlePollutionData;
    const activeMeans = props.activeMeans;

    const user = props.user;
    const color = props.color || user?.color || "#aa0c54";
    const logo = user?.logo || AreaButlerLogo;

    let page = 0;
    const nextPageNumber = (): string => {
      page += 1;
      return page < 9 ? `0${page}` : `${page}`;
    };

    return (
      <div
        className="overflow-hidden w-0 h-0 print:overflow-visible print:w-full print:h-full print:block"
        ref={ref}
      >
        {/*TODO create the isTrial parameter in the subscription object (on the backend side I guess)*/}
        {user?.subscription?.type === ApiSubscriptionPlanType.TRIAL && (
          <img
            className="fixed w-0 h-0 print:w-full print:h-full top-1/2 left-1/2 opacity-40"
            src={areaButlerLogo}
            alt="watermark"
            style={{
              height: "30vh",
              transform: "translate(-50%, -50%) rotate(45deg)",
              zIndex: 100,
            }}
          />
        )}
        <PdfPage nextPageNumber={nextPageNumber} logo={logo} title="Überblick">
          <ExposeSummary
            realEstateListing={props.realEstateListing}
            groupedEntries={groupedEntries}
            transportationParams={transportationParams}
            activeMeans={activeMeans}
            listingAddress={props.listingAddress}
            primaryColor={color}
            qrCode={props.qrCode}
          />
        </PdfPage>
        {importantEntities?.items?.length && (
          <PdfPage nextPageNumber={nextPageNumber} logo={logo} title="Umgebung">
            {importantEntities && importantEntities.items.length > 0 && (
              <div className="m-10">
                <EntityTable
                  activeMeans={activeMeans}
                  entityGroup={importantEntities!}
                  primaryColor={color}
                />
              </div>
            )}
          </PdfPage>
        )}
        {mapClippings.length > 0 && (
          <MapClippings
            mapClippings={mapClippings}
            nextPageNumber={nextPageNumber}
            logo={logo}
            qrCode={props.qrCode}
          />
        )}
        {mapClippings.length > 0 && props.legend.length > 0 && (
          <PdfPage
            nextPageNumber={nextPageNumber}
            logo={logo}
            title="Kartenlegende"
          >
            <div className="m-10">
              <Legend legend={props.legend} />
            </div>
          </PdfPage>
        )}
        {groupedEntries
          .filter(
            (entityGroup) =>
              entityGroup.active &&
              entityGroup.items.filter((i) => i.selected).length > 0
          )
          .map((entityGroup: EntityGroup) => {
            return (
              <PdfPage
                nextPageNumber={nextPageNumber}
                logo={logo}
                title={entityGroup.title}
                key={entityGroup.title}
              >
                <div className="m-10" key={"tab-content-" + entityGroup.title}>
                  <EntityTable
                    activeMeans={activeMeans}
                    entityGroup={entityGroup}
                    primaryColor={color}
                  />
                </div>
              </PdfPage>
            );
          })}
        <PdfPage title="Einblicke" logo={logo} nextPageNumber={nextPageNumber}>
          {censusData && censusData.length > 0 && (
            <>
              <h4 className="mx-10 mt-5 text-xl w-56 font-bold">
                Nachbarschaftsdemographie
              </h4>
              <CensusSummary primaryColor={color} censusData={censusData} />
            </>
          )}
          {federalElectionData && federalElectionData?.results?.length > 0 && (
            <>
              <h4 className="mx-10 text-xl w-56 font-bold">
                Bundestagswahl 2021
              </h4>
              <FederalElectionSummary
                primaryColor={color}
                federalElectionDistrict={federalElectionData}
              />
            </>
          )}
          {particlePollutionData && particlePollutionData.length > 0 && (
            <>
              <h4 className="mx-10 text-xl w-56 font-bold">
                Feinstaubbelastung
              </h4>
              <ParticlePollutionSummary
                primaryColor={color}
                particlePollutionData={particlePollutionData}
              />
            </>
          )}
        </PdfPage>
      </div>
    );
  }
);

export default Expose;
