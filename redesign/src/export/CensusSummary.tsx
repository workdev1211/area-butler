import {ApiGeojsonFeature} from "../../../shared/types/types";
import React from "react";


export interface CensusSummaryProps {
    censusData: ApiGeojsonFeature[];
}

export const CensusSummary: React.FunctionComponent<CensusSummaryProps> = ({
                                                                         censusData,
                                                                     }) => {
    const censusCenter = censusData[0] as any;

    return (
        <div>
            <h1 className="mb-10 text-xl font-bold">Nachbarschaftsdemographie</h1>
            {censusCenter && (
                <table className="table w-96">
                    <thead>
                    <tr>
                        <th>Beschreibung</th>
                        <th>Wert</th>
                    </tr>
                    </thead>
                    <tbody>
                    {censusCenter.properties.map(
                        (p: { label: string; value: string; unit: string }) => (
                            <tr key={p.label}>
                                <td>{p.label}</td>
                                <td>{p.value}{' '}{p.unit}</td>
                            </tr>
                        )
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
};
