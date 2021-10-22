import React, {useState} from "react";
import "./MapMenu.css";
import {EntityGroup, EntityRoute, ResultEntity} from "../pages/SearchResultPage";
import distanceIcon from "../assets/icons/icons-32-x-32-illustrated-ic-distance.svg";
import walkIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bicycleIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import {ApiCoordinates, OsmName} from "../../../shared/types/types";
import {deriveIconForOsmName} from "../shared/shared.functions";
import LocalityItem from "../components/LocalityItem";

export interface MapMenuProps {
    census: boolean;
    toggleCensus: (active: boolean) => void;
    groupedEntries: EntityGroup[];
    toggleEntryGroup: (title: string) => void;
    highlightZoomEntity: (item: ResultEntity) => void;
    mobileMenuOpen: boolean;
    toggleRoute: (item: ResultEntity) => void
    routes: EntityRoute[]
}

const MapMenu: React.FunctionComponent<MapMenuProps> = ({
                                                            census,
                                                            toggleCensus,
                                                            groupedEntries,
                                                            toggleEntryGroup,
                                                            highlightZoomEntity,
                                                            toggleRoute,
                                                            routes,
                                                            mobileMenuOpen
                                                        }) => {

    const [viewOptionsOpen, setViewOptionsOpen] = useState(true);
    const [localitiesOpen, setLocalitiesOpen] = useState(true);
    const [localityOpen, setLocalityOpen] = useState<string[]>([]);

    const toggleLocality = (title: string, open: boolean) => {
        const filtered = [...localityOpen.filter(l => l !== title)];
        if (open) {
            filtered.push(title);
        }
        setLocalityOpen(filtered);
    }

    const mobileMenuButtonClasses = `map-menu ${mobileMenuOpen ? 'mobile-open' : ''}`

    return <div className={mobileMenuButtonClasses}>
        <h2 className="heading">Ergebnisse</h2>
        <div
            className={'collapse collapse-arrow view-option' + (viewOptionsOpen ? ' collapse-open' : ' collapse-closed')}>
            <input type="checkbox" onChange={(event) => setViewOptionsOpen(event.target.checked)}/>
            <div className="collapse-title">
                Anzeigeoptionen
            </div>
            <div className="collapse-content">
                <ul>
                    <li>
                        <span>Zensus Atlas</span>
                        <label className="cursor-pointer label justify-start pl-0">
                            <input type="checkbox" checked={census} className="checkbox checkbox-primary checkbox-sm"
                                   onChange={(event) => toggleCensus(event.target.checked)}/>
                        </label>
                    </li>
                </ul>
            </div>
        </div>
        <div
            className={'collapse collapse-arrow view-option' + (localitiesOpen ? ' collapse-open' : ' collapse-closed')}>
            <input type="checkbox" onChange={(event) => setLocalitiesOpen(event.target.checked)}/>
            <div className="collapse-title">
                Lokalitäten
            </div>
            <div className="collapse-content">
                <ul>
                    {
                        groupedEntries.filter(ge => ge.items.length).map(ge => {
                            const groupIconInfo = deriveIconForOsmName(ge.items[0].type as OsmName);
                            return (<li className="locality-option-li"
                                        key={`grouped-entry-${ge.title}`}>
                                <div
                                    className={'collapse collapse-arrow locality-option' + (localityOpen.includes(ge.title) ? ' collapse-child-open' : ' collapse-child-closed')}>
                                    <input type="checkbox"
                                           onChange={(event) => toggleLocality(ge.title, event.target.checked)}/>
                                    <div className="collapse-title">
                                        <div onClick={() => toggleLocality(ge.title, !localityOpen.includes(ge.title))}>
                                            <div className="img-container" style={{'background': groupIconInfo.color}}>
                                                <img
                                                    src={groupIconInfo.icon}
                                                    alt="group-icon"
                                                    onClick={() => toggleLocality(ge.title, !ge.active)}/>
                                            </div>
                                            {ge.title} [{ge.items.length}]
                                        </div>
                                        <label className="cursor-pointer label justify-start pl-0">
                                            <input type="checkbox" checked={ge.active}
                                                   className="checkbox checkbox-primary checkbox-sm"
                                                   onChange={() => toggleEntryGroup(ge.title)}/>
                                        </label>
                                    </div>
                                    <div className="collapse-content">
                                        <div className="mean-items">
                                            <div className="item">
                                                <img src={distanceIcon} alt="icon-distance"/>
                                                Distanz
                                            </div>
                                            <div className="item">
                                                <img src={walkIcon} alt="icon-walk"/>
                                                Fußweg
                                            </div>
                                            <div className="item">
                                                <img src={bicycleIcon} alt="icon-bicycle"/>
                                                Fahrrad
                                            </div>
                                            <div className="item">
                                                <img src={carIcon} alt="icon-car"/>
                                                Auto
                                            </div>
                                        </div>
                                        {localityOpen.includes(ge.title) && ge.items.map((item,index) => <LocalityItem
                                            key={index}
                                            item={item}
                                            group={ge}
                                            onClickTitle={(item) => highlightZoomEntity(item)}
                                            onToggleRoute={(item) => toggleRoute(item) }
                                            route={routes?.find(r =>
                                                r.coordinates.lat === item.coordinates.lat &&
                                                r.coordinates.lng === item.coordinates.lng && r.show)}

                                        />)}
                                    </div>
                                </div>
                            </li>);
                        })
                    }
                </ul>
            </div>
        </div>
    </div>
}

export default MapMenu;
