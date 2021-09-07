import React from "react";

export interface ResultTableProps {
    title: string;
    data: ResultTableRow[];
}

export interface ResultTableRow {
    name?: string;
    distance: number;
}

const ResultTable: React.FunctionComponent<ResultTableProps> = (props) => {
    const data = props.data.slice(0, 10);
    const hasNames = data.some(sd => sd.name && sd.name.length);
    return (
        <>
            <h3 className="text-bold underline">{props.title} ({data.length})</h3>
            <table className="table-auto">
                <thead>
                <tr>
                    { hasNames && <th className="pr-4 py-1 text-left">Name</th> }
                    <th className={hasNames ? 'px-4 py-1 text-left' : 'py-1 text-left'}>Entfernung</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row: ResultTableRow) => <tr key={row.name + '-' + row.distance}>
                    { hasNames && <td className="pr-4 py-1">{row.name || '-'}</td> }
                    <td className={hasNames ? 'px-4 py-1' : 'py-1'}>{Math.trunc(row.distance)} m</td>
                </tr>)}
                </tbody>
            </table>
        </>
    )
}

export default ResultTable;
