import { Dispatch, SetStateAction, useContext } from "react";

import { SearchContext } from "../context/SearchContext";
import { useRouting } from "./routing";
import { RealEstateContext } from "../context/RealEstateContext";
import { useHttp } from "./http";
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import {
  ApiSearchResponse,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
} from "../../../shared/types/types";
import { IBusyModalItem } from "../components/BusyModal";
import { getUncombinedOsmEntityTypes } from "../../../shared/functions/shared.functions";

export const useAnalysis = () => {
  const { searchContextState } = useContext(SearchContext);
  const { realEstateState } = useContext(RealEstateContext);

  const { post } = useHttp();
  const { fetchRoutes, fetchTransitRoutes } = useRouting();

  const createSnapshot = async (
    items: IBusyModalItem[],
    setBusyModalItems: Dispatch<SetStateAction<IBusyModalItem[]>>,
    searchResponse: ApiSearchResponse,
    userEmail?: string
  ): Promise<ApiSearchResultSnapshotResponse> => {
    const routes: EntityRoute[] = [];
    const transitRoutes: EntityTransitRoute[] = [];
    const location = searchContextState.location!;
    const preferredLocations: ApiPreferredLocation[] =
      searchContextState.preferredLocations || [];

    let index = 0;

    // TODO change to await for in case of HERE API rate limits
    await Promise.all(
      preferredLocations.map(async (preferredLocation) => {
        items.push({
          key: `fetch-routes-${preferredLocation.title}-${index}`,
        });
        setBusyModalItems([...items]);

        const routesResult = await fetchRoutes({
          userEmail,
          meansOfTransportation: [
            MeansOfTransportation.BICYCLE,
            MeansOfTransportation.CAR,
            MeansOfTransportation.WALK,
          ],
          origin: location,
          destinations: [
            {
              title: preferredLocation.title,
              coordinates: preferredLocation.coordinates!,
            },
          ],
        });

        routes.push({
          routes: routesResult[0].routes,
          title: routesResult[0].title,
          show: [],
          coordinates: preferredLocation.coordinates!,
        });

        items.push({
          key: `fetch-transit-routes-${preferredLocation.title}-${index}`,
        });
        setBusyModalItems([...items]);

        const transitRoutesResult = await fetchTransitRoutes({
          userEmail,
          origin: location,
          destinations: [
            {
              title: preferredLocation.title,
              coordinates: preferredLocation.coordinates!,
            },
          ],
        });

        if (transitRoutesResult.length && transitRoutesResult[0].route) {
          transitRoutes.push({
            route: transitRoutesResult[0].route,
            title: transitRoutesResult[0].title,
            show: false,
            coordinates: preferredLocation.coordinates!,
          });
        }

        index += 1;
      })
    );

    items.push({
      key: "save-map-snippet",
    });
    setBusyModalItems([...items]);

    return (
      await post<ApiSearchResultSnapshotResponse>("/api/location/snapshot", {
        placesLocation: searchContextState.placesLocation,
        location,
        transportationParams: searchContextState.transportationParams,
        localityParams: getUncombinedOsmEntityTypes(
          searchContextState.localityParams
        ),
        searchResponse: searchResponse,
        realEstateListings: realEstateState.listings,
        preferredLocations,
        routes,
        transitRoutes,
      })
    ).data;
  };

  return { createSnapshot };
};
