import { useHttp } from "./http";
import {
  ApiRouteQuery,
  ApiRouteQueryResultItem,
  ApiTransitRouteQuery,
  ApiTransitRouteQueryResultItem,
  IApiPreferredLocationRouteQuery,
  IApiPreferredLocationRouteQueryResult,
} from "../../../shared/types/routing";

export const useRouting = () => {
  const { post } = useHttp();

  const fetchRoutes = async (query: ApiRouteQuery) =>
    (await post("/api/routes/fetch", query)).data as ApiRouteQueryResultItem[];

  const fetchTransitRoutes = async (query: ApiTransitRouteQuery) =>
    (await post("/api/routes/fetch-transit", query))
      .data as ApiTransitRouteQueryResultItem[];

  const fetchPreferredLocationRoutes = async (
    query: IApiPreferredLocationRouteQuery
  ) =>
    (await post("/api/routes/fetch-preferred", query))
      .data as IApiPreferredLocationRouteQueryResult;

  return { fetchRoutes, fetchTransitRoutes, fetchPreferredLocationRoutes };
};
