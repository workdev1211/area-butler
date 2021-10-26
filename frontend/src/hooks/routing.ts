import {useHttp} from "./http";
import {ApiRouteQuery, ApiRouteQueryResultItem} from "../../../shared/types/routing";

export const useRouting = () => {
    const { post } = useHttp();

    const fetchRoutes = async (query: ApiRouteQuery) => {
        return (await post("/api/routes/search", query)).data as ApiRouteQueryResultItem[]
    }
    return {fetchRoutes}
}
