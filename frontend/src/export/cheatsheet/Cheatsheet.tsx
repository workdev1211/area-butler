import { forwardRef, useContext } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { EntityList } from "export/EntityList";
import FederalElectionSummary from "export/FederalElectionSummary";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import ParticlePollutionSummary from "export/ParticlePollutionSummary";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { allRealEstateCostTypes } from "../../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiSearchResponse,
  OsmName,
  TransportationParam,
} from "../../../../shared/types/types";
import { CensusSummary } from "../CensusSummary";
import MapClippings from "../MapClippings";
import { PdfPage } from "../PdfPage";
import areaButlerLogo from "../../assets/img/logo.svg";
import { EntityGroup, ResultEntity } from "../../shared/search-result.types";
import { getRealEstateCost } from "../../shared/real-estate.functions";
import { ILegendItem, Legend } from "../Legend";
import { QrCode } from "../QrCode";
import { IQrCodeState } from "../../../../shared/types/export";
import { TCensusData } from "../../../../shared/types/data-provision";
import { SearchContext } from "../../context/SearchContext";

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
  color: string;
  logo: string;
  isTrial: boolean;
  legend: ILegendItem[];
  qrCode: IQrCodeState;
  style: string;
}

const chunkSize = 25;

export const Cheatsheet = forwardRef((props: ICheatsheetProps, ref) => {
  const { t } = useTranslation();
  const {
    searchContextState: { responseConfig },
  } = useContext(SearchContext);

  const qrCodeElement = props.qrCode.isShownQrCode ? <QrCode /> : <div />;

  const filteredGroups = props.groupedEntries.filter(
    (group: EntityGroup) =>
      group.name !== OsmName.favorite && group.active && group.items.length > 0
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
  const particlePollutionData = props.particlePollutionData;
  const translatedLegend = props.legend.map(({ title, ...rest }) => ({
    ...rest,
    title: t(
      (IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>)[
        title
      ]
    ),
  }));

  let page = 0;
  const nextPageNumber = (): string => {
    page += 1;
    return page < 9 ? `0${page}` : `${page}`;
  };

  return (
    <div
      id="cheatsheet-pdf"
      className="overflow-hidden w-0 h-0 print:overflow-visible print:w-full print:h-full print:block"
      ref={ref as any}
    >
      <style>{props.style}</style>

      {props.isTrial && (
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
        title={t(IntlKeys.snapshotEditor.exportTab.summary)}
        logo={props.logo}
        nextPageNumber={nextPageNumber}
        leftHeaderElement={qrCodeElement}
      >
        <div className="m-10 flex flex-col gap-2">
          {!props.realEstateListing && (
            <>
              <div className="text-2xl font-bold">{props.listingAddress}</div>
              <div className="text-xl font-bold mt-1 text-black">
                {t(IntlKeys.snapshotEditor.exportTab.locationOverview)}
              </div>
            </>
          )}

          {props.realEstateListing && (
            <>
              <h3 className="text-2xl w-56 font-bold text-black">
                {t(IntlKeys.snapshotEditor.exportTab.locationOverview)}
              </h3>

              <div className="font-bold">{props.realEstateListing.address}</div>

              {responseConfig?.isDetailsShown &&
                props.realEstateListing?.costStructure && (
                  <div>
                    <strong>
                      {t(IntlKeys.snapshotEditor.exportTab.costs)}:
                    </strong>{" "}
                    {getRealEstateCost(props.realEstateListing?.costStructure)}{" "}
                    (
                    {t(
                      (IntlKeys.realEstate.costTypes as Record<string, string>)[
                        allRealEstateCostTypes.find(
                          (t) =>
                            t.type ===
                            props.realEstateListing.costStructure?.type
                        )?.type || ""
                      ]
                    )}
                    )
                  </div>
                )}

              {/* Furnishing */}
              {/*{props.realEstateListing.characteristics?.furnishing && (*/}
              {/*  <div>*/}
              {/*    <strong>Ausstattung:</strong>{" "}*/}
              {/*    {allFurnishing*/}
              {/*      .filter((f) =>*/}
              {/*        props.realEstateListing.characteristics?.furnishing.includes(*/}
              {/*          f.type*/}
              {/*        )*/}
              {/*      )*/}
              {/*      .map((f) => f.label)*/}
              {/*      .join(", ")}*/}
              {/*  </div>*/}
              {/*)}*/}
            </>
          )}
        </div>

        <div className="mx-5 flex gap-2 flex-wrap">
          {chunkedGroupes.length === 0 ? (
            <div>{t(IntlKeys.snapshotEditor.exportTab.noLocationSelected)}</div>
          ) : (
            chunkedGroupes[0].map((group) => (
              <div className="text-xs" key={`tab-content-${group.name}`}>
                <EntityList
                  entityGroup={group}
                  limit={3}
                  primaryColor={props.color}
                />
              </div>
            ))
          )}
        </div>
      </PdfPage>

      {chunkedGroupes.length > 1 &&
        chunkedGroupes.slice(1).map((chunk, i) => (
          <PdfPage
            title={t(IntlKeys.snapshotEditor.exportTab.summary)}
            logo={props.logo}
            nextPageNumber={nextPageNumber}
            leftHeaderElement={qrCodeElement}
            key={`entity-group-chunk-${i}`}
          >
            <div className="mx-5 flex gap-2 flex-wrap pt-3">
              {chunk.map((group) => {
                return (
                  <div className="text-xs" key={`tab-content-${group.name}`}>
                    <EntityList
                      entityGroup={group}
                      limit={3}
                      primaryColor={props.color}
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
          logo={props.logo}
          nextPageNumber={nextPageNumber}
          qrCode={props.qrCode}
        />
      )}

      {mapClippings.length > 0 && props.legend.length > 0 && (
        <PdfPage
          nextPageNumber={nextPageNumber}
          logo={props.logo}
          title={t(IntlKeys.snapshotEditor.exportTab.cardLegend)}
          leftHeaderElement={qrCodeElement}
        >
          <div className="ml-10 mt-3">
            <Legend legend={translatedLegend} />
          </div>
        </PdfPage>
      )}

      {(censusData || federalElectionData || particlePollutionData) && (
        <PdfPage
          title={t(IntlKeys.snapshotEditor.exportTab.insights)}
          logo={props.logo}
          nextPageNumber={nextPageNumber}
          leftHeaderElement={qrCodeElement}
        >
          {censusData && censusData.addressData.length > 0 && (
            <>
              <h4 className="mx-10 mt-5 text-xl w-56 font-bold">
                {t(IntlKeys.snapshotEditor.exportTab.neighborhoodDemographic)}
              </h4>
              <CensusSummary
                primaryColor={props.color}
                censusData={censusData}
              />
            </>
          )}

          {federalElectionData && (
            <>
              <h4 className="mx-10 text-xl w-56 font-bold">
                {t(IntlKeys.snapshotEditor.exportTab.federalElections)}
              </h4>
              <FederalElectionSummary
                primaryColor={props.color}
                federalElectionDistrict={federalElectionData}
              />
            </>
          )}

          {particlePollutionData && particlePollutionData.length > 0 && (
            <>
              <h4 className="mx-10 text-xl w-56 font-bold">
                {t(
                  IntlKeys.snapshotEditor.environmentInfo
                    .particulateMatterPollution
                )}
              </h4>
              <ParticlePollutionSummary
                primaryColor={props.color}
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
