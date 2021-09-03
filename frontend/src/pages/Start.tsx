import React, {FunctionComponent, useState} from 'react';

type GeoLocation = {
    latitude?: number | null,
    longitude?: number | null
}

const Start: FunctionComponent = () => {
    const [locationBusy, setLocationBusy] = useState(false);
    const [location, setLocation] = useState<GeoLocation>({
    });
    const locateUser = () => {
        if (window.navigator.geolocation) {
            setLocationBusy(true);
            setLocation({})
            window.navigator.geolocation.getCurrentPosition(
                (res: GeolocationPosition) => {
                    setLocation({
                        longitude: res.coords.longitude,
                        latitude: res.coords.latitude
                    });
                    setLocationBusy(false);
                },
                (error: any) => setLocationBusy(false)
            );
        }
    }
    return (
        <div className="container mx-auto mt-10">
            <h1 className="flex text-2xl">Umgebungsanalyse</h1>
            <form>
                <div className="grid grid-cols-2 gap-6 mt-5">
                    <label className="col-span-2">
                        <span className="text-gray-500">Adresse</span>
                        <input type="text"
                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                               placeholder="Suchen..."/>
                    </label>
                    <div className="flex gap-6">
                        <label className="flex-1">
                            <span className="text-gray-500">Lat</span>
                            <input type="text"
                                   value={location.latitude || ''}
                                   onChange={(event: any) => setLocation({...location, latitude: event.target.value})}
                                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                   placeholder="Latitude"/>
                        </label>
                        <label className="flex-1">
                            <span className="text-gray-500">Long</span>
                            <input type="text"
                                   value={location.longitude || ''}
                                   onChange={(event: any) => setLocation({...location, longitude: event.target.value})}
                                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                   placeholder="Longitude"/>
                        </label>
                    </div>
                    <div className="flex items-end m-0.5">
                        <button
                            type="button"
                            disabled={locationBusy}
                            onClick={locateUser}
                            className="inline-flex items-center justify-center h-10 px-5 text-white bg-red-600 rounded-lg focus:shadow-outline hover:bg-red-700 transition ease-in-out duration-150">
                            { locationBusy && <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-white"
                                                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg> }
                            Mein Standort
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Start;
