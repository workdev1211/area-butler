import React from "react";
import {EntityGroup, EntityRoute, ResultEntity} from "../pages/SearchResultPage";
import {MeansOfTransportation, OsmName} from "../../../shared/types/types";
import {deriveMinutesFromMeters} from "../shared/shared.functions";

export interface LocalityItemProps {
    item: ResultEntity,
    group: EntityGroup,
    onClickTitle: (item: ResultEntity) => void;
    onToggleRoute: (item: ResultEntity) => void;
    route?: EntityRoute;
}

const LocalityItem: React.FunctionComponent<LocalityItemProps> = ({item, group, onClickTitle, onToggleRoute, route}) => {
    return (
        <div
            className="locality-item"
            key={`locality-item-${group.title}-${item.id}`}>
            <h4 className="locality-item-title cursor-pointer"
                onClick={() => onClickTitle(item)}>{item.name ?? group.title}</h4>
            {item.type === OsmName.favorite ?  <PreferredLocationItemContent item={item} onToggleRoute={() => onToggleRoute(item)} route={route}/> : <LocalityItemContent item={item} />}
        </div>
    )
}
const PreferredLocationItemContent: React.FunctionComponent<{item:ResultEntity, onToggleRoute: (item: ResultEntity) => void, route?: EntityRoute }> = ({item, onToggleRoute, route}) => {
        const byFootDuration = route?.routes.find(r => r.meansOfTransportation === MeansOfTransportation.WALK)?.duration ?? '-';
        const byCarDuration = route?.routes.find(r => r.meansOfTransportation === MeansOfTransportation.CAR)?.duration ?? '-';
        const byBicycleDuration = route?.routes.find(r => r.meansOfTransportation === MeansOfTransportation.BICYCLE)?.duration ?? '-';

        return (
            <>
            <div className="locality-item-content">
                <input type="checkbox"
                       checked={route?.show}
                       onChange={(event) => onToggleRoute(item)}/>
                <span className="ml-2">Routen & Zeiten anzeigen</span>
            </div>
                {route?.show &&
    <div className="locality-item-content">
        <div className="locality-item-cell">
            <span className="locality-item-cell-label">Distanz</span>
            <span>{Math.round(item.distanceInMeters)}m</span>
        </div>

        <div className="locality-item-cell">
            <span className="locality-item-cell-label">Fußweg</span>
            <span>{byFootDuration} Min.</span>
        </div>
        <div className="locality-item-cell">
            <span className="locality-item-cell-label">Fahrrad</span>
            <span>{byBicycleDuration} Min.</span>
        </div>
        <div className="locality-item-cell">
            <span className="locality-item-cell-label">Auto</span>
            <span>{byCarDuration} Min.</span>
        </div>
    </div>}
            </>
        )
}

const LocalityItemContent: React.FunctionComponent<{item:ResultEntity}> = ({item}) => {
    return (
            <div className="locality-item-content">
                <div className="locality-item-cell">
                    <span className="locality-item-cell-label">Distanz</span>
                    <span>{Math.round(item.distanceInMeters)}m</span>
                </div>
                <div className="locality-item-cell">
                    <span className="locality-item-cell-label">Fußweg</span>
                    <span>{deriveMinutesFromMeters(item.distanceInMeters, MeansOfTransportation.WALK)} Min.</span>
                </div>
                <div className="locality-item-cell">
                    <span className="locality-item-cell-label">Fahrrad</span>
                    <span>{deriveMinutesFromMeters(item.distanceInMeters, MeansOfTransportation.BICYCLE)} Min.</span>
                </div>
                <div className="locality-item-cell">
                    <span className="locality-item-cell-label">Auto</span>
                    <span>{deriveMinutesFromMeters(item.distanceInMeters, MeansOfTransportation.CAR)} Min.</span>
                </div>
            </div>
    )
}

export default LocalityItem