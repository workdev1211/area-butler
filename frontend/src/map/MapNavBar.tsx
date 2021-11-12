import React from "react";
import "./MapNavBar.css";
import {meansOfTransportations} from "../../../shared/constants/constants";
import {MeansOfTransportation, TransportationParam, UnitsOfTransportation} from "../../../shared/types/types";

export interface MapNavBarProps {
    transportationParams: TransportationParam[];
    availableMeans: MeansOfTransportation[];
    activeMeans: MeansOfTransportation[];
    onMeansChange: (newValues: MeansOfTransportation[]) => void;
    showPreferredLocations: boolean;
    onToggleShowPreferredLocations: (show: boolean) => void;
    showMyObjects: boolean;
    onToggleShowMyObjects: (show: boolean) => void;
}

const MapNavBar: React.FunctionComponent<MapNavBarProps> = ({
                                                                transportationParams,
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

    return <div className="map-nav-bar-container" data-tour="map-navbar">
        <div className="map-nav-bar">
            <div className="flex gap-4 items-center">
                {availableMeans.map(
                    mean => {
                        const param = transportationParams.find(tp => tp.type === mean);
                        return (<button className={activeMeans.includes(mean) ? 'btn btn-link active' : 'btn btn-link'}
                                onClick={() => toggleMean(mean)} key={`mean-${mean}`}>
                            <span className={deriveBackgroundClass(mean)}/>
                            {meansOfTransportations.find(mot => mot.type === mean)?.label} ({param?.amount} {param?.unit === UnitsOfTransportation.METERS ? 'm' : 'min'})
                        </button>);
                    }
                )}
            </div>
        </div>
    </div>
}

export default MapNavBar;
