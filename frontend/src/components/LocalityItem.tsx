import React from "react";
import {EntityGroup, EntityRoute, EntityTransitRoute, ResultEntity} from "../pages/SearchResultPage";
import {MeansOfTransportation, OsmName} from "../../../shared/types/types";
import {deriveMinutesFromMeters, distanceToHumanReadable, timeToHumanReadable} from "../shared/shared.functions";

export interface LocalityItemProps {
    item: ResultEntity,
    group: EntityGroup,
    onClickTitle: (item: ResultEntity) => void;
    onToggleRoute: (item: ResultEntity) => void;
    route?: EntityRoute;
    onToggleTransitRoute: (item: ResultEntity) => void;
    transitRoute?: EntityTransitRoute;
}

const LocalityItem: React.FunctionComponent<LocalityItemProps> = ({item, group, onClickTitle, onToggleRoute, route, onToggleTransitRoute, transitRoute}) => {
    return (
        <div
            className="locality-item"
            key={`locality-item-${group.title}-${item.id}`}>
            <h4 className="locality-item-title cursor-pointer"
                onClick={() => onClickTitle(item)}>{item.name ?? group.title}</h4>
            {item.type === OsmName.favorite ?  <PreferredLocationItemContent item={item} onToggleRoute={() => onToggleRoute(item)} onToggleTransitRoute={() => onToggleTransitRoute(item)} route={route} transitRoute={transitRoute}/> : <LocalityItemContent item={item} />}
        </div>
    )
}
const PreferredLocationItemContent: React.FunctionComponent<{item:ResultEntity, onToggleRoute: (item: ResultEntity) => void, route?: EntityRoute, onToggleTransitRoute: (item: ResultEntity) => void, transitRoute?: EntityTransitRoute }> = ({item, onToggleRoute, route, onToggleTransitRoute, transitRoute}) => {
        const byFootDuration = route?.routes.find(r => r.meansOfTransportation === MeansOfTransportation.WALK)?.sections.map(s => s.duration).reduce((p,c) => p + c) ?? '-';
        const byCarDuration = route?.routes.find(r => r.meansOfTransportation === MeansOfTransportation.CAR)?.sections.map(s => s.duration).reduce((p,c) => p + c) ?? '-';
        const byBicycleDuration = route?.routes.find(r => r.meansOfTransportation === MeansOfTransportation.BICYCLE)?.sections.map(s => s.duration).reduce((p,c) => p + c) ?? '-';
        const transitDuration = transitRoute?.route.sections.map(s => s.duration).reduce((p,c) => p + c) ?? '-';

        return (
            <>
            <div className="locality-item-content">
                <input type="checkbox"
                       checked={route?.show || false}
                       onChange={(event) => onToggleRoute(item)}/>
                <span className="ml-2">Routen & Zeiten anzeigen</span>
                &nbsp;
                <input type="checkbox"
                       checked={transitRoute?.show || false}
                       onChange={(event) => onToggleTransitRoute(item)}/>
                <span className="ml-2">ÖPNV Route anzeigen</span>
            </div>

    <div className="locality-item-content">
        {route?.show &&
        <>
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
        </>}
        {transitRoute?.show &&
        <div className="locality-item-cell">
            <span className="locality-item-cell-label">ÖPNV</span>
            <span>{transitDuration} Min.</span>
        </div>

        }
    </div>

            </>
        )
}

const LocalityItemContent: React.FunctionComponent<{item:ResultEntity}> = ({item}) => {
    return (
            <div className="locality-item-content">
                <div className="locality-item-cell">
                    <span className="locality-item-cell-label">Distanz</span>
                    <span>{distanceToHumanReadable(item.distanceInMeters)}</span>
                </div>
                <div className="locality-item-cell">
                    <span className="locality-item-cell-label">Fußweg</span>
                    <span>{timeToHumanReadable(deriveMinutesFromMeters(item.distanceInMeters, MeansOfTransportation.WALK))}</span>
                </div>
                <div className="locality-item-cell">
                    <span className="locality-item-cell-label">Fahrrad</span>
                    <span>{timeToHumanReadable(deriveMinutesFromMeters(item.distanceInMeters, MeansOfTransportation.BICYCLE))}</span>
                </div>
                <div className="locality-item-cell">
                    <span className="locality-item-cell-label">Auto</span>
                    <span>{timeToHumanReadable(deriveMinutesFromMeters(item.distanceInMeters, MeansOfTransportation.CAR))}</span>
                </div>
            </div>
    )
}

export default LocalityItem
