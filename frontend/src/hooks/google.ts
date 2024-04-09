import { useContext, useEffect, useState } from "react";
import { Loader, Library } from "@googlemaps/js-api-loader";

import { ConfigContext } from "../context/ConfigContext";
import { googleMapsApiOptions } from "../shared/shared.constants";

export const useGoogleMapsApi = (library: Library = "places"): boolean => {
  const { googleApiKey } = useContext(ConfigContext);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!googleApiKey) {
      return;
    }

    const googleMapsApiLoader = new Loader({
      apiKey: googleApiKey,
      ...googleMapsApiOptions,
    });

    const loadGoogleMapsApi = async (): Promise<void> => {
      await googleMapsApiLoader.importLibrary(library);
      setIsLoaded(true);
    };

    void loadGoogleMapsApi();
  }, [googleApiKey, library]);

  return isLoaded;
};
