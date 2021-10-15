import React, {useState} from "react";
import "./MapMenu.css";
import {EntityGroups} from "../pages/SearchResultPage";

export interface MapMenuProps {
    census: boolean;
    toggleCensus: (active: boolean) => void;
    groupedEntries: EntityGroups[];
    toggleEntryGroup: (title: string) => void;
}

const MapMenu: React.FunctionComponent<MapMenuProps> = ({census, toggleCensus, groupedEntries, toggleEntryGroup}) => {

    const [viewOptionsOpen, setViewOptionsOpen] = useState(true);
    const [localitiesOpen, setLocalitiesOpen] = useState(true);

    return <div className="map-menu">
        <h2 className="heading">Ergebnisse</h2>
        <div className={'collapse collapse-arrow view-option' + (viewOptionsOpen ? ' collapse-open' : ' collapse-closed')}>
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
        <div className={'collapse collapse-arrow view-option' + (localitiesOpen ? ' collapse-open' : ' collapse-closed')}>
            <input type="checkbox" onChange={(event) => setLocalitiesOpen(event.target.checked)}/>
            <div className="collapse-title">
                Lokalitäten
            </div>
            <div className="collapse-content">
                <ul>
                    {
                        groupedEntries.filter(ge => ge.items.length).map(ge => <li key={`grouped-entry-${ge.title}`}>
                            <span>{ge.title} [{ge.items.length}]</span>
                            <label className="cursor-pointer label justify-start pl-0">
                                <input type="checkbox" checked={ge.active} className="checkbox checkbox-primary checkbox-sm"
                                       onChange={() => toggleEntryGroup(ge.title)}/>
                            </label>
                        </li> )
                    }
                </ul>
            </div>
        </div>
    </div>
}

export default MapMenu;
