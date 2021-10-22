import {useHttp} from "./http";
import {ApiRoute, ApiRouteQuery, ApiRouteQueryResultItem} from "../../../shared/types/routing";

export const useRouting = () => {
    const { post } = useHttp();

    const fetchRoutes = async (query: ApiRouteQuery) => {
        const result = (await post("/api/routes/search", query)).data as ApiRouteQueryResultItem[];
        return result
    }
    return {fetchRoutes}
}
