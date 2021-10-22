import React from "react";
import "./MapNavBar.css";
import {meansOfTransportations} from "../../../shared/constants/constants";
import {MeansOfTransportation} from "../../../shared/types/types";

export interface MapNavBarProps {
    availableMeans: MeansOfTransportation[];
    activeMeans: MeansOfTransportation[];
    onMeansChange: (newValues: MeansOfTransportation[]) => void;
    showPreferredLocations: boolean;
    onToggleShowPreferredLocations: (show: boolean) => void;
    showMyObjects: boolean;
    onToggleShowMyObjects: (show: boolean) => void;
}

const MapNavBar: React.FunctionComponent<MapNavBarProps> = ({
                                                                availableMeans,
                                                                activeMeans,
                                                                onMeansChange,
                                                                showPreferredLocations,
                                                                onToggleShowPreferredLocations,
                                                                showMyObjects,
                                                                onToggleShowMyObjects
                                                            }) => {
    const toggleMean = (mean: MeansOfTransportation) => {
        const newValues = activeMeans.includes(mean) ? activeMeans.filter(am => am !== mean) : [
            ...activeMeans,
            mean
        ];
        onMeansChange(newValues);
    }

    const deriveBackgroundClass = (mean: MeansOfTransportation) => {
        switch (mean) {
            case MeansOfTransportation.WALK:
                return 'bg-primary';
            case MeansOfTransportation.BICYCLE:
                return 'bg-accent';
            case MeansOfTransportation.CAR:
                return 'bg-base-content';
        }
    }

    return <div className="map-nav-bar-container">
        <div className="map-nav-bar">
            <div className="flex gap-4 items-center">
                {availableMeans.map(
                    mean =>
                        <button className={activeMeans.includes(mean) ? 'btn btn-link active' : 'btn btn-link'}
                                onClick={() => toggleMean(mean)} key={`mean-${mean}`}>
                            <span className={deriveBackgroundClass(mean)}/>
                            {meansOfTransportations.find(mot => mot.type === mean)?.label}
                        </button>
                )}
            </div>
            <div className="checkboxes">
                <label>
                    <input type="checkbox"  checked={showMyObjects}
                           onChange={(event) => onToggleShowMyObjects(event.target.checked)}/>
                    <span>Meine Objekte</span>
                </label>
                <label>
                    <input type="checkbox" checked={showPreferredLocations}
                           onChange={(event) => onToggleShowPreferredLocations(event.target.checked)}/>
                    <span>Wichtige Adressen</span>
                </label>
            </div>
        </div>
    </div>
}

export default MapNavBar;
