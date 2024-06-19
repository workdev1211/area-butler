import { useHttp } from "./http";
import {
  ApiRouteQuery,
  ApiRouteQueryResultItem,
  ApiTransitRouteQuery,
  ApiTransitRouteQueryResultItem,
} from "../../../shared/types/routing";
import { useTools } from "./tools";

export const useRouting = () => {
  const { post } = useHttp();
  const { getTokenData } = useTools();

  const { token, isAddressShown } = getTokenData();

  const fetchRoutes = async (
    query: ApiRouteQuery
  ): Promise<ApiRouteQueryResultItem[]> => {
    query.snapshotToken = token;
    query.isAddressShown = isAddressShown;

    return (await post<ApiRouteQueryResultItem[]>("/api/routes/fetch", query))
      .data;
  };

  const fetchTransitRoutes = async (
    query: ApiTransitRouteQuery
  ): Promise<ApiTransitRouteQueryResultItem[]> => {
    query.snapshotToken = token;
    query.isAddressShown = isAddressShown;

    return (
      await post<ApiTransitRouteQueryResultItem[]>(
        "/api/routes/fetch-transit",
        query
      )
    ).data;
  };

  return { fetchRoutes, fetchTransitRoutes };
};
