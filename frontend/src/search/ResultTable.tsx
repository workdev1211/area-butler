import React, { useContext } from "react";
import {calculateMinutesToMeters} from "../../../shared/constants/constants";
import {MeansOfTransportation} from "../../../shared/types/types";
import {ResultEntity} from "./SearchResult";
import {fallbackIcon, osmNameToIcons} from "../map/makiIcons";
import { SearchContext, SearchContextActions } from "context/SearchContext";

export interface ResultTableProps {
    title: string;
    data: ResultEntity[];
}

const ResultTable: React.FunctionComponent<ResultTableProps> = (props) => {
    const {searchContextDispatch} = useContext(SearchContext);
    const data = props.data.slice(0, 10);
    const hasNames = data.some(sd => sd.name && sd.name.length);
    const deriveMinutesFromMeters = (distanceInMeters: number, mean: MeansOfTransportation) => {
        return distanceInMeters / (calculateMinutesToMeters.find(mtm => mtm.mean === mean)?.multiplicator || 1);
    }
    const type = data[0].type;
    return (
        <>
            <div className="flex ml-2">
                <img alt="icon" src={osmNameToIcons.find(entry => entry.name === type)?.icon || fallbackIcon} className={type}/>
                <h3 className="text-xl ml-2">
                {props.title} ({data.length})</h3>
            </div>
            <table className="table w-full mt-5">
                <thead>
                <tr>
                    {hasNames && <th className="pr-4 py-1 text-left">Name</th>}
                    <th className={hasNames ? 'px-4 py-1 text-left' : 'py-1 text-left'}>Entfernung</th>
                    <th className="px-4 py-1 text-left">Zu Fuß</th>
                    <th className="px-4 py-1 text-left">Fahrrad</th>
                    <th className="px-4 py-1 text-left">Auto</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row: ResultEntity) => <tr
                    className="hover cursor-pointer"
                    onClick={()=>  searchContextDispatch({type: SearchContextActions.SET_SELECTED_CENTER, payload: row.coordinates})}
                    key={'result-table-' + props.title + '-' + row.name + row.distanceInMeters}>
                    {hasNames && <td className="pr-4 py-1">{row.name || '-'}</td>}
                    <td className={hasNames ? 'px-4 py-1' : 'py-1'}>{row.distanceInMeters ? Math.trunc(row.distanceInMeters) + ' m' : 'unbekannt'}</td>
                    <td className="px-4 py-1">{row.byFoot ? `${Math.trunc(deriveMinutesFromMeters(row.distanceInMeters, MeansOfTransportation.WALK))} min` : ''}</td>
                    <td className="px-4 py-1">{row.byBike ? `${Math.trunc(deriveMinutesFromMeters(row.distanceInMeters, MeansOfTransportation.BICYCLE))} min` : ''}</td>
                    <td className="px-4 py-1">{row.byCar ? `${Math.trunc(deriveMinutesFromMeters(row.distanceInMeters, MeansOfTransportation.CAR))} min` : ''}</td>
                </tr>)}
                </tbody>
            </table>
        </>
    )
}

export default ResultTable;
