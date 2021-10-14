import React from "react";
import "./MapNavBar.css";
import {meansOfTransportations} from "../../../shared/constants/constants";
import {MeansOfTransportation} from "../../../shared/types/types";

export interface MapNavBarProps {
    availableMeans: MeansOfTransportation[];
    activeMeans: MeansOfTransportation[];
    onChange: (newValues: MeansOfTransportation[]) => void;
}

const MapNavBar: React.FunctionComponent<MapNavBarProps> = ({availableMeans, activeMeans, onChange}) => {
    const toggleMean = (mean: MeansOfTransportation) => {
        const newValues = activeMeans.includes(mean) ? activeMeans.filter(am => am !== mean) : [
            ...activeMeans,
            mean
        ];
        onChange(newValues);
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
            <div className="flex gap-4 items-center pl-20">
                <label className="cursor-pointer label justify-start pl-0">
                    <input type="checkbox" className="checkbox checkbox-primary checkbox-sm"/>
                    <span className="label-text ml-2 font-normal text-base">Meine Objekte</span>
                </label>
                <label className="cursor-pointer label justify-start pl-0">
                    <input type="checkbox" className="checkbox checkbox-primary checkbox-sm"/>
                    <span className="label-text ml-2 font-normal text-base">Wichtige Adressen</span>
                </label>
            </div>
        </div>
    </div>
}

export default MapNavBar;
