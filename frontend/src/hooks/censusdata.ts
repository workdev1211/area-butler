import {useHttp} from "./http";
import {ApiCoordinates, ApiGeometry} from "../../../shared/types/types";
import circle from "@turf/circle";
import {Feature, Polygon, Properties} from "@turf/helpers";

const DISTANCE = 1000;
const CIRCLE_OPTIONS: Properties = {units: 'kilometers' };

const calculateRelevantArea = (coords: ApiCoordinates): Feature<Polygon> => {
    const radius = DISTANCE / 1000;
    const center = [coords.lng, coords.lat];
    return circle(center, radius, CIRCLE_OPTIONS);
}

export const useCensusData = () => {
    const { post } = useHttp();

    const fetchNearData = async (coords: ApiCoordinates) => {
        const relevantArea = calculateRelevantArea(coords);
        const geo : ApiGeometry =  relevantArea.geometry;
        return await post("/api/zensus-atlas/query", geo);
    }
    return {fetchNearData}
}
