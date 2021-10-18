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
    const groupedEntries = props.groupedEntries.filter(
        ([label, data]: any) => label !== "Wichtige Adressen"
    );
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
                <div className="flex flex-col gap-6" style={{width: "1600px"}}>
                    {!!props.realEstateListing && (
                        <>
                            <h3 className="text-xl w-56 font-bold">Objektdetails</h3>
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
                    <h1 className="text-xl font-bold">Personengruppen</h1>
                    <PersonaRanking rankings={mockData}/>
                    {!!censusData && censusData.length > 0 && (
                        <CensusSummary censusData={censusData}/>
                    )}
                </div>
            </PdfPage>
            <PdfPage>
                <h1 className="text-xl font-bold">Die naheliegendsten Standorte</h1>
                <div className="flex gap-6 flex-wrap">
                    {groupedEntries.map(group => {
                        return (
                            <div className="text-xs w-80" key={"tab-content-" + group.title}>
                                {/*<ResultTable*/}
                                {/*  dataSelectable={false}*/}
                                {/*  title={label}*/}
                                {/*  data={data.filter((e: ResultEntity) => e.selected)}*/}
                                {/*  limit={3}*/}
                                {/*  showRoutingColumns={false}*/}
                                {/*/>*/}
                            </div>
                        );
                    })}
                </div>
            </PdfPage>
            {activePrinting && (
                <>
                    <PdfPage>
                        <h1 className="m-10 text-xl font-bold">Kartenausschnitte</h1>
                        <MapClippings
                            mapClippings={mapClippings}
                            showTitles={false}
                        />
                    </PdfPage>
                </>
            )}
        </div>
    );
});

export default Cheatsheet;
