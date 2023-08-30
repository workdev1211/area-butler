import { useHttp } from "./http";
import {
  ApiRouteQuery,
  ApiRouteQueryResultItem,
  ApiTransitRouteQuery,
  ApiTransitRouteQueryResultItem,
} from "../../../shared/types/routing";

export const useRouting = () => {
  const { post } = useHttp();

  const fetchRoutes = async (
    query: ApiRouteQuery
  ): Promise<ApiRouteQueryResultItem[]> =>
    (await post<ApiRouteQueryResultItem[]>("/api/routes/fetch", query)).data;

  const fetchTransitRoutes = async (
    query: ApiTransitRouteQuery
  ): Promise<ApiTransitRouteQueryResultItem[]> =>
    (
      await post<ApiTransitRouteQueryResultItem[]>(
        "/api/routes/fetch-transit",
        query
      )
    ).data;

  return { fetchRoutes, fetchTransitRoutes };
};
