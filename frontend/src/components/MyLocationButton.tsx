import React, {useState} from "react";
import {ApiCoordinates} from "../../../shared/types/types";
import positionIcon from "../assets/icons/icons-16-x-16-outline-ic-position.svg";

export interface MyLocationButtonProps {
    onComplete: (result: ApiCoordinates) => void;
    classes?: string;
}

const MyLocationButton: React.FunctionComponent<MyLocationButtonProps> = ({onComplete, classes}) => {
    const [locationBusy, setLocationBusy] = useState(false);
    const locateUser = () => {
        if (window.navigator.geolocation) {
            setLocationBusy(true);
            window.navigator.geolocation.getCurrentPosition(
                (res: GeolocationPosition) => {
                    const { longitude, latitude } = res.coords;
                    onComplete({lng: longitude, lat: latitude});
                    setLocationBusy(false);
                },
                (error: any) => setLocationBusy(false)
            );
        }
    };
    return (
        <button
            type="button"
            disabled={locationBusy}
            onClick={locateUser}
            className={locationBusy ? classes + ' loading' : classes}
        >
            Aktueller Standort <img className="ml-1 -mt-0.5" src={positionIcon} alt="icon-position"/>
        </button>
    )
}

export default MyLocationButton;
