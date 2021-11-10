import { FederalElectionDistrict, FederalElectionResult } from "hooks/federalelectiondata";
import { FunctionComponent } from "react";

export interface FederalElectionSummaryProps {
    federalElectionDistrict: FederalElectionDistrict;
}


const FederalElectionSummary: FunctionComponent<FederalElectionSummaryProps> = ({federalElectionDistrict}) => {

    return <div>
            <h1 className="mb-10 text-xl font-bold">Bundestagswahl 2021 - Wahlkreis {federalElectionDistrict.name}</h1>
            {federalElectionDistrict && (
                <table className="table w-96">
                    <thead>
                    <tr>
                        <th>Partei</th>
                        <th>Ergebnis Zweitstimme (Prozent)</th>
                        <th>Ergebnis bei der letzten Wahl</th>
                    </tr>
                    </thead>
                    <tbody>
                    {federalElectionDistrict.results.map(
                        (p: FederalElectionResult) => (
                            <tr key={p.party}>
                                <td>{p.party}</td>
                                <td>{p.percentage} %</td>
                                <td>{p.lastElectionPercentage} %</td>
                            </tr>
                        )
                    )}
                    </tbody>
                </table>
            )}
        </div>
}

export default FederalElectionSummary;