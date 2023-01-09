import { forwardRef } from "react";

import { EntityList } from "export/EntityList";
import FederalElectionSummary from "export/FederalElectionSummary";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import ParticlePollutionSummary from "export/ParticlePollutionSummary";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../../shared/constants/real-estate";
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
import areaButlerLogo from "../../assets/img/logo.svg";
import {
  EntityGroup,
  ResultEntity,
} from "../../components/SearchResultContainer";
import { getRealEstateCost } from "../../shared/real-estate.functions";
import { ILegendItem, Legend } from "../Legend";
import { QrCode } from "../QrCode";
import { IQrCodeState } from "../ExportModal";
import { ApiSubscriptionPlanType } from "../../../../shared/types/subscription-plan";
import { TCensusData } from "../../hooks/censusdata";
import { preferredLocationsTitle } from "../../shared/shared.functions";

interface ICheatsheetProps {
  searchResponse: ApiSearchResponse;
  entities: ResultEntity[];
  censusData?: TCensusData;
  particlePollutionData: ApiGeojsonFeature[];
  federalElectionData: FederalElectionDistrict;
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  activePrinting: boolean;
  mapClippings: ISelectableMapClipping[];
  user: ApiUser | null;
  color?: string;
  legend: ILegendItem[];
  qrCode: IQrCodeState;
}

const chunkSize = 25;

export const Cheatsheet = forwardRef((props: ICheatsheetProps, ref) => {
  const qrCodeElement = props.qrCode.isShownQrCode ? (
    <QrCode snapshotToken={props.qrCode.snapshotToken} />
  ) : (
    <div />
  );

  const filteredGroups = props.groupedEntries.filter(
    (group: EntityGroup) =>
      group.title !== preferredLocationsTitle &&
      group.active &&
      group.items.length > 0
  );

  const chunkedGroupes = filteredGroups.reduce<Array<EntityGroup[]>>(
    (result, item, i) => {
      const chunkIndex = Math.floor(
        i / (i < chunkSize ? chunkSize - 1 : chunkSize)
      );

      if (!result[chunkIndex]) {
        result[chunkIndex] = [];
      }

      result[chunkIndex].push(item);

      return result;
    },
    []
  );

  const mapClippings = props.mapClippings;
  const censusData = props.censusData;
  const federalElectionData = props.federalElectionData;
  const user = props.user;
  const color = props.color || user?.color || "#aa0c54";
  const logo = user?.logo || areaButlerLogo;
  const particlePollutionData = props.particlePollutionData;

  let page = 0;
  const nextPageNumber = (): string => {
    page += 1;
    return page < 9 ? `0${page}` : `${page}`;
  };

  return (
    <div
      className="overflow-hidden w-0 h-0 print:overflow-visible print:w-full print:h-full print:block"
      ref={ref as any}
    >
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
      <PdfPage
        title="Zusammenfassung"
        logo={logo}
        nextPageNumber={nextPageNumber}
        leftHeaderElement={qrCodeElement}
      >
        <div className="m-10 flex flex-col gap-2">
          {!props.realEstateListing && (
            <>
              <div className="text-2xl font-bold">{props.listingAddress}</div>
              <div className="text-xl font-bold mt-1">Lage Überblick</div>
            </>
          )}

          {props.realEstateListing && (
            <>
              <h3 className="text-2xl w-56 font-bold">Lage Überblick</h3>
              <div className="font-bold">{props.realEstateListing.address}</div>
              {props.realEstateListing?.costStructure && (
                <div>
                  <strong>Kosten:</strong>{" "}
                  {getRealEstateCost(props.realEstateListing?.costStructure)} (
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

        <div className="mx-5 flex gap-2 flex-wrap">
          {chunkedGroupes.length === 0 ? (
            <div>Keine Orte ausgewählt</div>
          ) : (
            chunkedGroupes[0].map((group) => (
              <div className="text-xs" key={`tab-content-${group.title}`}>
                <EntityList
                  entityGroup={group}
                  limit={3}
                  primaryColor={color}
                />
              </div>
            ))
          )}
        </div>
      </PdfPage>

      {chunkedGroupes.length > 1 &&
        chunkedGroupes.slice(1).map((chunk, i) => (
          <PdfPage
            title="Zusammenfassung"
            logo={logo}
            nextPageNumber={nextPageNumber}
            leftHeaderElement={qrCodeElement}
            key={`entity-group-chunk-${i}`}
          >
            <div className="mx-5 flex gap-2 flex-wrap pt-3">
              {chunk.map((group) => {
                return (
                  <div className="text-xs" key={`tab-content-${group.title}`}>
                    <EntityList
                      entityGroup={group}
                      limit={3}
                      primaryColor={color}
                    />
                  </div>
                );
              })}
            </div>
          </PdfPage>
        ))}

      {mapClippings.length > 0 && (
        <MapClippings
          mapClippings={mapClippings}
          logo={logo}
          nextPageNumber={nextPageNumber}
          qrCode={props.qrCode}
        />
      )}

      {mapClippings.length > 0 && props.legend.length > 0 && (
        <PdfPage
          nextPageNumber={nextPageNumber}
          logo={logo}
          title="Kartenlegende"
          leftHeaderElement={qrCodeElement}
        >
          <div className="ml-10 mt-3">
            <Legend legend={props.legend} />
          </div>
        </PdfPage>
      )}

      {(censusData || federalElectionData || particlePollutionData) && (
        <PdfPage
          title="Einblicke"
          logo={logo}
          nextPageNumber={nextPageNumber}
          leftHeaderElement={qrCodeElement}
        >
          {censusData && censusData.addressData.length > 0 && (
            <>
              <h4 className="mx-10 mt-5 text-xl w-56 font-bold">
                Nachbarschaftsdemographie
              </h4>
              <CensusSummary primaryColor={color} censusData={censusData} />
            </>
          )}

          {federalElectionData && (
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
      )}
    </div>
  );
});

export default Cheatsheet;
