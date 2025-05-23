import { ForwardedRef, forwardRef } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { EntityTable } from "export/EntityTable";
import FederalElectionSummary from "export/FederalElectionSummary";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import ParticlePollutionSummary from "export/ParticlePollutionSummary";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  LanguageTypeEnum,
  MeansOfTransportation,
  OsmName,
  TransportationParam,
} from "../../../../shared/types/types";
import { CensusSummary } from "../CensusSummary";
import MapClippings from "../MapClippings";
import { PdfPage } from "../PdfPage";
import ExposeSummary from "./ExposeSummary";
import { EntityGroup } from "../../shared/search-result.types";
import { ILegendItem, Legend } from "../Legend";
import areaButlerLogo from "../../assets/img/logo.svg";
import { IQrCodeState } from "../../../../shared/types/export";
import { TCensusData } from "../../../../shared/types/data-provision";

interface IExposeProps {
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  activePrinting: boolean;
  mapClippings: ISelectableMapClipping[];
  color: string;
  logo: string;
  isTrial: boolean;
  legend: ILegendItem[];
  qrCode: IQrCodeState;
  censusData?: TCensusData;
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  style: string;
  outputLanguage: LanguageTypeEnum;
}

const chunkSize = 24;

export const Expose = forwardRef(
  (props: IExposeProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { t } = useTranslation("", { lng: props.outputLanguage });

    const filteredGroups = props.groupedEntries.filter(
      (group) =>
        group.name !== OsmName.favorite &&
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

    const importantEntities = props.groupedEntries.find(
      (group) => group.active && group.name === OsmName.favorite
    );

    const transportationParams = props.transportationParams;
    const mapClippings = props.mapClippings;
    const censusData = props.censusData;
    const federalElectionData = props.federalElectionData;
    const particlePollutionData = props.particlePollutionData;
    const activeMeans = props.activeMeans;

    let page = 0;
    const nextPageNumber = (): string => {
      page += 1;
      return page < 9 ? `0${page}` : `${page}`;
    };

    return (
      <div
        id="expose-pdf"
        className="overflow-hidden w-0 h-0 print:overflow-visible print:w-full print:h-full print:block"
        ref={ref}
      >
        <style>{props.style}</style>
        {/*TODO create the isTrial parameter in the subscription object (on the backend side I guess)*/}
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
        {chunkedGroupes.map((chunk, i) => (
          <PdfPage
            outputLanguage={props.outputLanguage}
            nextPageNumber={nextPageNumber}
            logo={props.logo}
            leftHeaderElement={
              <div className="text-2xl font-bold">
                {t(IntlKeys.snapshotEditor.dataTab.environmentalAnalysis)}
              </div>
            }
            key={`entity-group-chunk-${i}`}
          >
            <ExposeSummary
              realEstateListing={props.realEstateListing}
              groupedEntries={chunk}
              transportationParams={transportationParams}
              activeMeans={activeMeans}
              listingAddress={props.listingAddress}
              primaryColor={props.color}
              qrCode={props.qrCode}
              isFirstPage={i === 0}
              outputLanguage={props.outputLanguage}
            />
          </PdfPage>
        ))}
        {importantEntities?.items?.length && (
          <PdfPage
            outputLanguage={props.outputLanguage}
            nextPageNumber={nextPageNumber}
            logo={props.logo}
            leftHeaderElement={
              <div className="text-2xl font-bold">
                {t(IntlKeys.snapshotEditor.dataTab.surroundingsHeader)}
              </div>
            }
          >
            {importantEntities && importantEntities.items.length > 0 && (
              <div className="m-10">
                <EntityTable
                  outputLanguage={props.outputLanguage}
                  activeMeans={activeMeans}
                  entityGroup={importantEntities!}
                  primaryColor={props.color}
                />
              </div>
            )}
          </PdfPage>
        )}
        {mapClippings.length > 0 && (
          <MapClippings
            outputLanguage={props.outputLanguage}
            mapClippings={mapClippings}
            nextPageNumber={nextPageNumber}
            logo={props.logo}
            qrCode={props.qrCode}
          />
        )}
        {mapClippings.length > 0 && props.legend.length > 0 && (
          <PdfPage
            outputLanguage={props.outputLanguage}
            nextPageNumber={nextPageNumber}
            logo={props.logo}
            leftHeaderElement={
              <div className="text-2xl font-bold">
                {t(IntlKeys.snapshotEditor.dataTab.cardLegend)}
              </div>
            }
          >
            <div className="m-10">
              <Legend legend={props.legend} />
            </div>
          </PdfPage>
        )}
        {filteredGroups
          .filter((group) => group.items.filter((i) => i.selected).length > 0)
          .map((group) => {
            return (
              <PdfPage
                outputLanguage={props.outputLanguage}
                nextPageNumber={nextPageNumber}
                logo={props.logo}
                leftHeaderElement={
                  <div className="text-2xl font-bold">{group.title}</div>
                }
                key={group.name}
              >
                <div className="m-10" key={`tab-content-${group.name}`}>
                  <EntityTable
                    outputLanguage={props.outputLanguage}
                    activeMeans={activeMeans}
                    entityGroup={group}
                    primaryColor={props.color}
                  />
                </div>
              </PdfPage>
            );
          })}
        {(censusData || federalElectionData || particlePollutionData) && (
          <PdfPage
            outputLanguage={props.outputLanguage}
            nextPageNumber={nextPageNumber}
            logo={props.logo}
            leftHeaderElement={
              <div className="text-2xl font-bold">
                {t(IntlKeys.snapshotEditor.dataTab.insights)}
              </div>
            }
          >
            {censusData && censusData.addressData.length > 0 && (
              <>
                <h4 className="mx-10 mt-5 text-xl w-56 font-bold">
                  {t(IntlKeys.snapshotEditor.dataTab.neighborhoodDemographic)}
                </h4>
                <CensusSummary
                  primaryColor={props.color}
                  censusData={censusData}
                />
              </>
            )}
            {federalElectionData && federalElectionData?.results?.length > 0 && (
              <>
                <h4 className="mx-10 text-xl w-56 font-bold">
                  {t(IntlKeys.snapshotEditor.dataTab.federalElections)}
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
  }
);

export default Expose;
