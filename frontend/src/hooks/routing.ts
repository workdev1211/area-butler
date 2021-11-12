import {useHttp} from "./http";
import {
    ApiRouteQuery,
    ApiRouteQueryResultItem,
    ApiTransitRouteQuery,
    ApiTransitRouteQueryResultItem
} from "../../../shared/types/routing";

export const useRouting = () => {
    const { post } = useHttp();

    const fetchRoutes = async (query: ApiRouteQuery) => {
        return (await post("/api/routes/search", query)).data as ApiRouteQueryResultItem[]
    }

    const fetchTransitRoutes = async (query: ApiTransitRouteQuery) => {
        return (await post("/api/routes/search-transit", query)).data as ApiTransitRouteQueryResultItem[]
    }
    return {fetchRoutes, fetchTransitRoutes}
}
